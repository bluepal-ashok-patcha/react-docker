// src/pages/PDFReader.jsx
import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { GlobalWorkerOptions } from 'pdfjs-dist/build/pdf'; // single import
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker source to the file in public folder
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

function PDFReader({ fileUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  return (
    <div style={{ textAlign: 'center', marginTop: 20 }}>
      <Document
        file={{ url: fileUrl }}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={(error) => console.error('Error loading PDF:', error)}
      >
        <Page pageNumber={pageNumber} />
      </Document>

      {numPages && (
        <div style={{ marginTop: 10 }}>
          <button onClick={() => setPageNumber(p => Math.max(p - 1, 1))} disabled={pageNumber <= 1}>
            ◀ Previous
          </button>

          <span style={{ margin: '0 10px' }}>
            Page {pageNumber} of {numPages}
          </span>

          <button onClick={() => setPageNumber(p => Math.min(p + 1, numPages))} disabled={pageNumber >= numPages}>
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
}

export default PDFReader;
