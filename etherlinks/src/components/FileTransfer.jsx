import React from 'react';

const FileTransfer = ({ file, progress }) => {
    return (
        <div>
            {file && (
                <div>
                    <p>File: {file.name}</p>
                    <p>Transfer Progress: {progress}%</p>
                </div>
            )}
        </div>
    );
};

export default FileTransfer;
