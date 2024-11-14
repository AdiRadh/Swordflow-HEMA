import React, { useEffect, useRef } from 'react';
import Uppy, { UppyFile } from '@uppy/core';
import DragDrop from '@uppy/drag-drop';
import  Tus from '@uppy/tus';
import ProgressBar from '@uppy/progress-bar';
import '@uppy/core/dist/style.css';
import '@uppy/drag-drop/dist/style.css';
import '@uppy/progress-bar/dist/style.css';

const UppyComponent: React.FC = () => {
  const dragDropRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const uploadedFilesRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const uppy = new Uppy({ debug: true, autoProceed: true });

    const onUploadSuccess = (file: UppyFile<any, any> | undefined, response: any) => {
      if (!file) return;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = response.uploadURL;
      a.target = '_blank';
      a.appendChild(document.createTextNode(file.name || 'Unnamed file'));
      li.appendChild(a);

      uploadedFilesRef.current?.appendChild(li);
    };

    uppy
      .use(DragDrop, { target: dragDropRef.current || undefined })
      .use(Tus, {
        endpoint: '/get-upload-url',
        chunkSize: 150 * 1024 * 1024,
      })
      .use(ProgressBar, {
        target: progressBarRef.current || undefined,
        hideAfterFinish: false,
      })
      .on('upload-success', onUploadSuccess);

    return () => uppy.cancelAll();
  }, []);

  const handleUploadClick = () => {
    const uppy = new Uppy({ debug: true, autoProceed: true });
    if (uppy) {
      uppy.upload();
    }
  };

  return (
    <div>
      <div ref={dragDropRef} style={{ height: '300px' }}></div>
      <div ref={progressBarRef}></div>
      <button onClick={handleUploadClick} style={{ fontSize: '30px', margin: '20px' }}>
        Upload
      </button>
      <div style={{ marginTop: '50px' }}>
        <ol ref={uploadedFilesRef}></ol>
      </div>
    </div>
  );
};

export default UppyComponent;