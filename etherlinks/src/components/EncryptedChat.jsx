import React, { useState } from 'react';

const EncryptedChat = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');

    const handleInputChange = (event) => {
        setMessage(event.target.value);
    };

    const handleSendClick = () => {
        onSendMessage(message);
        setMessage('');
    };

    return (
        <div>
            <input type="text" value={message} onChange={handleInputChange} />
            <button onClick={handleSendClick}>Send</button>
        </div>
    );
};

export default EncryptedChat;
