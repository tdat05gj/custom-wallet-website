const express = require('express');
const { ethers } = require('ethers');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/generate', async (req, res) => {
    try {
        const desiredEnding = req.body.ending;
        
        if (!desiredEnding || typeof desiredEnding !== 'string') {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid ending specified' 
            });
        }

        let found = false;
        let walletInfo;

        while (!found) {
            // Kiểm tra nếu request bị abort
            if (req.aborted) {
                return res.status(499).json({ 
                    success: false, 
                    error: 'Request cancelled by client' 
                });
            }

            const wallet = ethers.Wallet.createRandom();
            const address = wallet.address;

            if (address.endsWith(desiredEnding)) {
                found = true;
                walletInfo = {
                    address: address,
                    privateKey: wallet.privateKey,
                    mnemonic: wallet.mnemonic.phrase
                };
            }
        }

        res.json({ 
            success: true,
            address: walletInfo.address,
            privateKey: walletInfo.privateKey,
            mnemonic: walletInfo.mnemonic
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});