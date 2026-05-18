// ==========================================
// 1. BLOCKCHAIN CORE LOGIC
// ==========================================
class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data; // Structure: { voter, candidate }
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0; // Used for basic Proof of Work mining simulator
    }

    calculateHash() {
        return CryptoJS.SHA256(
            this.index + 
            this.previousHash + 
            this.timestamp + 
            JSON.stringify(this.data) + 
            this.nonce
        ).toString();
    }

    // Simple proof-of-work mechanism to demonstrate computational confirmation
    mineBlock(difficulty) {
        const target = Array(difficulty + 1).join("0");
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Block mined: ${this.hash}`);
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2; // Mimics network block settlement time
        this.votedAddresses = new Set();
    }

    createGenesisBlock() {
        return new Block(0, new Date().toUTCString(), { info: "Genesis Block - Voting Initialized" }, "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addVoteBlock(voterAddress, candidate) {
        // Enforce Double-Voting Prevention Rules
        if (this.votedAddresses.has(voterAddress)) {
            alert("Security Error: This cryptographic identity has already recorded a ballot!");
            return false;
        }

        const newBlock = new Block(
            this.chain.length,
            new Date().toUTCString(),
            { voter: voterAddress, candidate: candidate },
            this.getLatestBlock().hash
        );

        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
        this.votedAddresses.add(voterAddress);
        return true;
    }

    // Validates absolute historical linkage cryptographic integrity
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Integrity Check: Has data inside this block been altered?
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return { valid: false, brokenBlock: i };
            }

            // Linkage Check: Does this block reference the true previous hash?
            if (currentBlock.previousHash !== previousBlock.hash) {
                return { valid: false, brokenBlock: i };
            }
        }
        return { valid: true };
    }
}

// Initialize Global Engine Database Instance
const VotingNetwork = new Blockchain();

// ==========================================
// 2. FRONTEND ENGINE / DOM RENDERING
// ==========================================

// Generates dynamic mock cryptographic addresses for randomized voters
function generateVoterIdentity() {
    const hex = "0123456789abcdef";
    let mockAddress = "0x";
    for (let i = 0; i < 40; i++) {
        mockAddress += hex[Math.floor(Math.random() * 16)];
    }
    document.getElementById('voterAddress').value = mockAddress;
}

// Render live mathematical audit panel results
function updateResultsUI() {
    const container = document.getElementById('candidatesContainer');
    container.innerHTML = '';

    const currentTally = {
        "Alice Vance (Democracy Party)": 0,
        "Bob Miller (Liberty Alliance)": 0,
        "Charlie Song (Green Future)": 0
    };

    // Extract vote counts explicitly out of the immutable blockchain sequence
    for(let i = 1; i < VotingNetwork.chain.length; i++) {
        const targetCandidate = VotingNetwork.chain[i].data.candidate;
        if(currentTally.hasOwnProperty(targetCandidate)) {
            currentTally[targetCandidate]++;
        }
    }

    for (const [candidate, votes] of Object.entries(currentTally)) {
        const card = document.createElement('div');
        card.className = 'candidate-card';
        card.innerHTML = `
            <div class="candidate-info">
                <h3>${candidate}</h3>
            </div>
            <div class="vote-count">${votes} Votes</div>
        `;
        container.appendChild(card);
    }
}

// Render structured node tree components onto visual stream
function renderBlockchainUI() {
    const visualizer = document.getElementById('blockchainVisualizer');
    const blockCountSpan = document.getElementById('blockCount');
    visualizer.innerHTML = '';
    
    blockCountSpan.innerText = `Blocks: ${VotingNetwork.chain.length}`;
    const validationStatus = VotingNetwork.isChainValid();

    VotingNetwork.chain.forEach((block, index) => {
        const isGenesis = index === 0;
        const isBroken = !validationStatus.valid && index >= validationStatus.brokenBlock;
        
        const blockEl = document.createElement('div');
        blockEl.className = `block-card ${isGenesis ? 'genesis' : ''} ${isBroken ? 'invalid' : ''}`;
        
        blockEl.innerHTML = `
            <div class="block-header">
                <span class="block-id">${isGenesis ? 'GENESIS BLOCK #0' : 'VOTE BLOCK #' + index}</span>
                <span class="block-time">${block.timestamp}</span>
            </div>
            <div class="status-badge ${isBroken ? 'status-tampered' : 'status-valid'}">
                ${isBroken ? 'INVALID / BROKEN LINK' : 'VERIFIED IN IMMUTABLE LEDGER'}
            </div>
            <div class="data-payload">
                <strong>Transaction Data Payload:</strong><br>
                ${isGenesis ? block.data.info : `Voter: <small>${block.data.voter}</small><br><strong>Voted For: ${block.data.candidate}</strong>`}
            </div>
            <div class="hash-box">
                <span>PREV HASH:</span> ${block.previousHash}<br>
                <span>BLOCK HASH:</span> ${block.hash}
            </div>
            ${!isGenesis ? `<button class="tamper-btn" onclick="simulateTampering(${index})">⚠️ Maliciously Corrupt Data</button>` : ''}
        `;
        visualizer.appendChild(blockEl);
    });

    // Update Network Health Flags
    const auditFlag = document.getElementById('ledgerIntegrity');
    if(validationStatus.valid) {
        auditFlag.innerText = "SECURE & VALID";
        auditFlag.style.color = "var(--accent)";
    } else {
        auditFlag.innerText = `COMPROMISED (BLOCK SYSTEM CORRUPTED AT POSITION ${validationStatus.brokenBlock})`;
        auditFlag.style.color = "var(--danger)";
    }
}

// Handler bound to submission button click actions
function processVote() {
    const address = document.getElementById('voterAddress').value;
    const selectedCandidate = document.getElementById('candidateSelect').value;

    const statusSuccess = VotingNetwork.addVoteBlock(address, selectedCandidate);

    if (statusSuccess) {
        updateResultsUI();
        renderBlockchainUI();
        generateVoterIdentity(); // Give next voter a new test address key signature automatically
    }
}

// ATTACK VECTOR SIMULATION DEMO
// Demonstrates what happens when a hacker tries to modify database values out of order
function simulateTampering(blockIndex) {
    VotingNetwork.chain[blockIndex].data.candidate = "HACKER INTRUDER INJECTION";
    console.warn(`CRITICAL: Historical alteration executed manually on Block #${blockIndex}.`);
    
    // Refresh to instantly show broken links cascade down the ledger tree
    updateResultsUI();
    renderBlockchainUI();
}

// Initializing execution bindings
window.onload = function() {
    generateVoterIdentity();
    updateResultsUI();
    renderBlockchainUI();
}