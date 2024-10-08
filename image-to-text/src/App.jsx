// import { useEffect, useRef, useState } from "react";
// import LanguageSelector from "./components/LanguageSelector";
// import Progress from "./components/Progress";

// import "./App.css";

// function App() {
//   // Model loading
//   const [ready, setReady] = useState(null);
//   const [disabled, setDisabled] = useState(false);
//   const [progressItems, setProgressItems] = useState([]);

//   // Inputs and outputs
//   // const [input, setInput] = useState('I love walking my dog.');
//   // const [sourceLanguage, setSourceLanguage] = useState('eng_Latn');
//   // const [targetLanguage, setTargetLanguage] = useState('fra_Latn');
//   // const [output, setOutput] = useState('');

//   // Input and output
//   const [imageUrl, setImageUrl] = useState(
//     "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/handwriting.jpg"
//   );
//   const [output, setOutput] = useState("");

//   // Create a reference to the worker object.
//   const worker = useRef(null);

//   // We use the `useEffect` hook to setup the worker as soon as the `App` component is mounted.
//   useEffect(() => {
//     if (!worker.current) {
//       // Create the worker if it does not yet exist.
//       worker.current = new Worker(new URL("./worker.js", import.meta.url), {
//         type: "module",
//       });
//     }

//     // Create a callback function for messages from the worker thread.
//     const onMessageReceived = (e) => {
//       switch (e.data.status) {
//         case "initiate":
//           // Model file start load: add a new progress item to the list.
//           setReady(false);
//           setProgressItems((prev) => [...prev, e.data]);
//           break;

//         case "progress":
//           // Model file progress: update one of the progress items.
//           setProgressItems((prev) =>
//             prev.map((item) => {
//               if (item.file === e.data.file) {
//                 return { ...item, progress: e.data.progress };
//               }
//               return item;
//             })
//           );
//           break;

//         case "done":
//           // Model file loaded: remove the progress item from the list.
//           setProgressItems((prev) =>
//             prev.filter((item) => item.file !== e.data.file)
//           );
//           break;

//         case "ready":
//           // Pipeline ready: the worker is ready to accept messages.
//           setReady(true);
//           break;

//         case "update":
//           // Generation update: update the output text.
//           setOutput(e.data.output);
//           break;

//         case "complete":
//           // Generation complete: re-enable the "Translate" button
//           setDisabled(false);
//           break;
//       }
//     };

//     // Attach the callback function as an event listener.
//     worker.current.addEventListener("message", onMessageReceived);

//     // Define a cleanup function for when the component is unmounted.
//     return () =>
//       worker.current.removeEventListener("message", onMessageReceived);
//   });

//   const translate = () => {
//     setDisabled(true);
//     worker.current.postMessage({
//       text: input,
//       src_lang: sourceLanguage,
//       tgt_lang: targetLanguage,
//     });
//   };

//   const processImage = () => {
//     setDisabled(true);
//     worker.current.postMessage({
//       url: imageUrl,
//     });
//   };

//   return (
//     <>
//       <h1>Transformers.js</h1>
//       <h2>ML-powered multilingual translation in React!</h2>

//       <div className="container">
//         {/* <div className="language-container">
//           <LanguageSelector
//             type={"Source"}
//             defaultLanguage={"eng_Latn"}
//             onChange={(x) => setSourceLanguage(x.target.value)}
//           />
//           <LanguageSelector
//             type={"Target"}
//             defaultLanguage={"fra_Latn"}
//             onChange={(x) => setTargetLanguage(x.target.value)}
//           />
//         </div>

//         <div className="textbox-container">
//           <textarea
//             value={input}
//             rows={3}
//             onChange={(e) => setInput(e.target.value)}
//           ></textarea>
//           <textarea value={output} rows={3} readOnly></textarea>
//         </div>
//       </div>

//       <button disabled={disabled} onClick={translate}>
//         Translate
//       </button> */}

//         <div className="textbox-container">
//           <label>Image URL:</label>
//           <input
//             type="text"
//             value={imageUrl}
//             onChange={(e) => setImageUrl(e.target.value)}
//           />
//           <textarea value={output} rows={3} readOnly></textarea>
//         </div>
//       </div>

//       <button disabled={disabled} onClick={processImage}>
//         Process Image
//       </button>

//       <div className="progress-bars-container">
//         {ready === false && <label>Loading models... (only run once)</label>}
//         {progressItems.map((data) => (
//           <div key={data.file}>
//             <Progress text={data.file} percentage={data.progress} />
//           </div>
//         ))}
//       </div>
//     </>
//   );
// }

// export default App;


import { useEffect, useRef, useState } from 'react';
import Progress from './components/Progress';
import './App.css';

function App() {
  // Model loading
  const [ready, setReady] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [progressItems, setProgressItems] = useState([]);

  // Input and output
  const [imageUrl, setImageUrl] = useState('https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/handwriting.jpg');
  const [output, setOutput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Create a reference to the worker object.
  const worker = useRef(null);

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL('./worker.js', import.meta.url), {
        type: 'module'
      });
    }

    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case 'initiate':
          setReady(false);
          setProgressItems(prev => [...prev, e.data]);
          break;

        case 'progress':
          setProgressItems(prev => prev.map(item => 
            item.file === e.data.file ? { ...item, progress: e.data.progress } : item
          ));
          break;

        case 'done':
          setProgressItems(prev => prev.filter(item => item.file !== e.data.file));
          break;

        case 'ready':
          setReady(true);
          break;

        case 'complete':
          setOutput(e.data.output);
          setDisabled(false);
          break;
      }
    };

    worker.current.addEventListener('message', onMessageReceived);

    return () => worker.current.removeEventListener('message', onMessageReceived);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = () => {
    setDisabled(true);
    worker.current.postMessage({ url: imageUrl });
  };

  useEffect(() => {
    console.log("OUTPUT", output);
  }, [output]);

  return (
    <div className="app">
      <h1 className="title">Transformers.js</h1>
      <h2 className="subtitle">ML-powered Image-to-Text in React</h2>

      <div className="container">
        <div className="input-section">
          <label className="label">Image URL:</label>
          <input
            className="input-url"
            type="text"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            disabled={selectedFile !== null}
          />
          <input
            className="input-file"
            type="file"
            onChange={handleFileChange}
          />
          <textarea
            className="output"
            value={JSON.stringify(output, null, 2)}
            rows={3}
            readOnly
          ></textarea>
        </div>

        <div className="preview-section">
          <img src={imageUrl} alt="Preview" className="image-preview" />
        </div>
      </div>

      <button className="process-button" disabled={disabled} onClick={processImage}>
        {disabled ? 'Processing...' : 'Process Image'}
      </button>

      <div>
        {ready === false && (
          <label className="loading-label">Loading models... (only runs once)</label>
        )}
        {progressItems.map(data => (
          <div key={data.file}>
            <Progress text={data.file} percentage={data.progress} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
