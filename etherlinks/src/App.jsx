import React, { useState, useEffect } from 'react';
import './App.css';
import FileSelector from './components/FileSelector';
import FileTransfer from './components/FileTransfer';
import EncryptedChat from './components/EncryptedChat';
import * as wormhole from 'wormhole-crypto';
import { io } from 'socket.io-client';
import createWebTorrent from './webtorrent-wrapper';
import {Keychain} from "wormhole-crypto";

function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileTransferProgress, setFileTransferProgress] = useState(0);
    const [keyPair, setKeyPair] = useState(null);
    const [socket, setSocket] = useState(null);
    const [webTorrentClient, setWebTorrentClient] = useState(null);

    async function encryptMessage(keychain, message) {
        const messageBuffer = new TextEncoder().encode(message);
        const encryptedBuffer = await keychain.encryptMeta(messageBuffer);
        return new TextEncoder().encode(encryptedBuffer).toString('base64');
    }

    async function decryptMessage(keychain, encryptedMessage) {
        const encryptedBuffer = new TextDecoder().decode(atob(encryptedMessage));
        const messageBuffer = await keychain.decryptMeta(encryptedBuffer);
        return new TextDecoder().decode(messageBuffer);
    }


    useEffect(() => {
        const initializeKeyPair = async () => {
            const keyPair = await Keychain.generateKeyPair();
            setKeyPair(keyPair);
        };

        initializeKeyPair();
    }, []);


    useEffect(() => {
        const serverUrl = 'http://localhost:3001/';
        const socket = io(serverUrl);
        setSocket(socket);
        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const client = createWebTorrent();
        setWebTorrentClient(client);
        return () => {
            client.destroy();
        };
    }, []);


    useEffect(() => {
        if (!socket) return;

        socket.on('encryptedMessage', async (encryptedMessage) => {
            const decryptedMessage = await decryptMessage(encryptedMessage);
            console.log('Received Decrypted Message:', decryptedMessage);
        });

        return () => {
            socket.off('encryptedMessage');
        };
    }, [socket, decryptMessage]);

    useEffect(() => {
        if (!socket || !webTorrentClient) return;

        socket.on('receiveTorrentInfo', (torrentInfo) => {
            webTorrentClient.add(torrentInfo.magnetURI, (torrent) => {
                torrent.on('download', () => {
                    const progress = Math.floor((torrent.progress * 100) * 100) / 100;
                    setFileTransferProgress(progress);
                });

                torrent.files[0].getBlob((err, blob) => {
                    if (err) console.error(err);
                    else {
                        const downloadUrl = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        link.download = torrent.files[0].name;
                        link.click();
                    }
                });
            });
        });

        return () => {
            socket.off('receiveTorrentInfo');
        };
    }, [socket, webTorrentClient]);

    const handleFileSelected = (file) => {
        setSelectedFile(file);
        if (!webTorrentClient || !socket) return;

        webTorrentClient.seed(file, (torrent) => {
            const torrentInfo = {
                infoHash: torrent.infoHash,
                magnetURI: torrent.magnetURI,
            };
            socket.emit('sendTorrentInfo', torrentInfo);
        });
    };



    const handleSendMessage = async (message) => {
        const encryptedMessage = await encryptMessage(message);
        if (socket) {
            socket.emit('sendEncryptedMessage', encryptedMessage);
        }
    };

    return (
        <div className="App">
            <FileSelector onFileSelected={handleFileSelected} />
            <FileTransfer file={selectedFile} progress={fileTransferProgress} />
            <EncryptedChat onSendMessage={handleSendMessage} />
        </div>
    );
}

export default App;