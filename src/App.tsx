import "./App.css";
import { ChangeEvent, useState } from "react";
import { Container, Paper, Typography } from "@mui/material";
import pako from "pako";
import { decode } from "@msgpack/msgpack";

interface SaveDataStruct {
  data: unknown;
  info: unknown;
  preview: unknown;
}

interface SaveData {
  name: string;
  buffer: ArrayBuffer;
}

interface ViewerProp {
  data: SaveData;
}

function Viewer(props: ViewerProp) {
  const { data } = props;
  const { name, buffer } = data;
  let json = "";

  if (name.endsWith(".info")) {
    const decoder = new TextDecoder();
    json = decoder.decode(buffer);
  } else {
    // const hash = data.slice(0, 64);
    const raw = buffer.slice(64);

    const str = pako.inflateRaw(raw);
    const save = decode(str) as SaveDataStruct;
    json = JSON.stringify(
      {
        data: save.data,
        info: save.info,
      },
      null,
      2
    );
  }

  return (
    <>
      <Typography align="left" style={{ whiteSpace: "pre-wrap" }}>
        FileName: {name}
      </Typography>
      <Typography
        align="left"
        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {json}
      </Typography>
    </>
  );
}

function App() {
  const [data, setData] = useState<SaveData | null>(null);

  const showFile = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!e.target.files || !(e.target.files[0] instanceof Blob)) {
      return;
    }
    const name = e.target.files[0].name;
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (!e.target) {
        return;
      }
      const result = e.target.result;
      if (result instanceof ArrayBuffer) {
        setData({ name: name, buffer: result });
      }
    };
    reader.readAsArrayBuffer(e.target.files[0]);
  };

  return (
    <>
      <div>
        <input type="file" onChange={(e) => showFile(e)} />
      </div>
      <Container
        maxWidth="md"
        style={{
          margin: "30px auto 50px",
        }}
      >
        <Paper
          elevation={3}
          style={{
            padding: "50px 50px 30px 50px",
          }}
        >
          {(data && <Viewer data={data} />) || "File not loaded"}
        </Paper>
      </Container>
    </>
  );
}

export default App;
