import React from 'react';

const FileSelector = ({ onFileSelected }) => {
    const handleFileChange = (event) => {
        if (event.target.files.length > 0) {
            onFileSelected(event.target.files[0]);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
        </div>
    );
};

export default FileSelector;
