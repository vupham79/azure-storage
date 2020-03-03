import React, { useState, useEffect } from "react";
import * as azure from "./azure-storage.blob.min"; // var azure = require('./azure-storage.blob.js')
import { Button, Grid, Input, Typography } from "@material-ui/core";

const blobUri = "https://vuph123.blob.core.windows.net";
const SAS =
  "?sv=2019-02-02&ss=bfqt&srt=sco&sp=rwdlacup&se=2023-02-11T16:56:34Z&st=2020-03-03T08:56:34Z&spr=https&sig=1HC%2B66Wl60x8nPt4f%2BLraDQ7jFFXTd8j%2BzV1O%2BRimQw%3D";
const blobService = azure.createBlobServiceWithSas(blobUri, SAS);

function App() {
  const imageStyle = {
    backgroundSize: "cover",
    height: "10rem",
    width: "10rem",
    border: "1px solid black"
  };
  const [file, setFile] = useState(null);
  const [blobs, setBlobs] = useState([]);

  function getBlobs() {
    if (blobService) {
      blobService.listBlobsSegmented("container", null, function(
        error,
        results
      ) {
        if (error) {
          // List blobs error
          console.log("error: ", error);
          return error;
        } else {
          setBlobs(results.entries);
        }
      });
    }
  }

  useEffect(() => {
    getBlobs();
  }, []);

  function handleUpload() {
    if (!file) {
      alert("File is empty!");
      return;
    }

    const customBlockSize =
      file.size > 1024 * 1024 * 32 ? 1024 * 1024 * 4 : 1024 * 512;
    blobService.singleBlobPutThresholdInBytes = customBlockSize;

    blobService.createBlockBlobFromBrowserFile(
      "container",
      file.name,
      file,
      { blockSize: customBlockSize },
      function(error, result, response) {
        if (error) {
          // Upload blob failed
        } else {
          getBlobs();
        }
      }
    );
  }

  function handleDelete(blobName) {
    return function() {
      blobService.deleteBlobIfExists(
        "container",
        blobName,
        (error, result, response) => {
          if (error) {
            console.log("Delete error: ", error);
          }
          if (result) {
            getBlobs();
            console.log("Deleted: ", blobName);
          }
        }
      );
    };
  }

  function handleBrowse(e) {
    e.preventDefault();
    const file = e.target.files[0];
    if (file === null) {
      alert("No image is selected!");
      return;
    }
    if (file.size > 1024 * 1024 * 4) {
      alert("Image size must be less than 4MB!");
      return;
    }
    if (
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/jpg"
    ) {
      setFile(file);
      var output = document.getElementById("preview");
      output.src = URL.createObjectURL(e.target.files[0]);
    } else {
      alert("Please provide a valid image. (JPG, JPEG or PNG)");
    }
  }

  return (
    <Grid container justify="center" spacing={2} style={{ padding: "1rem" }}>
      <Typography variant={"h4"}>Azure Blob Storage</Typography>
      <Grid item container direction={"column"} alignItems={"center"}>
        <img style={imageStyle} id="preview" alt="" />
        <Input
          type="file"
          onChange={handleBrowse}
          style={{ display: "none" }}
          id="selectedFile"
        />
      </Grid>
      <Grid item container spacing={2} justify={"center"}>
        <Grid item>
          <Button
            variant="contained"
            color={"primary"}
            onClick={() => document.getElementById("selectedFile").click()}
          >
            Browse
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color={"primary"} onClick={handleUpload}>
            Upload
          </Button>
        </Grid>
      </Grid>
      <Grid item container spacing={2} justify={"center"}>
        {blobs &&
          blobs.map((blob, index) => (
            <Grid
              key={index}
              item
              container
              sm={2}
              direction={"column"}
              alignItems={"center"}
              spacing={2}
            >
              <Grid
                item
                style={{
                  ...imageStyle,
                  backgroundImage: `url(${blobUri}/container/${blob.name})`
                }}
              />
              <Grid item>
                <Button
                  variant="contained"
                  color={"secondary"}
                  onClick={handleDelete(blob.name)}
                >
                  Delete
                </Button>
              </Grid>
            </Grid>
          ))}
      </Grid>
    </Grid>
  );
}

export default App;
