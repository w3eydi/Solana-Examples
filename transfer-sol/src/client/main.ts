import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    sendAndConfirmTransaction,
    SystemProgram,
    Transaction,
    TransactionInstruction
} from '@solana/web3.js';
import { readFileSync } from 'fs';
import path from 'path';
import { Key } from 'readline';

const lo = require("buffer-layout");


/* Define Solana Network
 *
 *
 */

const SOLANA_NETWORK = "devnet";

let connection: Connection;
let programKeypair: Keypair;
let programId: PublicKey;

let test1: Keypair;
let eydi: Keypair;
let john: Keypair;

function createKeypairFromFile(path: string): Keypair {
    return Keypair.fromSecretKey(
        Buffer.from(JSON.parse(readFileSync(path, "utf-8")))
    )
}

// send lamports
async function sendLamports(from: Keypair, to: PublicKey, amount: number) {
    let data = Buffer.alloc(8); // 8 bytes alloc
    lo.ns64("value").encode(amount, data);

    let instruction = new TransactionInstruction({
        keys: [
            {pubkey: from.publicKey, isSigner: true, isWritable: false},
            {pubkey: to, isSigner: false, isWritable: true},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false}
        ],
        programId: programId,
        data: data
    })

    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(instruction),
        [from]
    );
}

async function main() {
    connection = new Connection(
        `https://api.${SOLANA_NETWORK}.solana.com`, 'confirmed'
    );

    programKeypair = createKeypairFromFile(
        path.join(
            path.resolve(__dirname, './../../_dist/program'),
            'program-keypair.json'
        )
    );

    programId = programKeypair.publicKey;

    test1 = createKeypairFromFile(__dirname + '/../../accounts/test1.json');
    eydi = createKeypairFromFile(__dirname + '/../../accounts/eydi.json');
    john = createKeypairFromFile(__dirname + '/../../accounts/john.json');


    console.log("Eydi sends some SOL to test1...");
    console.log(`   Eydi's public key: ${eydi.publicKey}`);
    console.log(`   test1's public key: ${test1.publicKey}`);
    await sendLamports(eydi, test1.publicKey, 40000000); // means 0.04 SOL

    console.log("test1 sends some SOL to John...");
    console.log(`   test1's public key: ${test1.publicKey}`);
    console.log(`   John's public key: ${john.publicKey}`);
    await sendLamports(test1, john.publicKey, 500000000); // means 0.5 SOL
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);