import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Ratings } from "../target/types/ratings";
import { expect } from "chai";

describe("ratings", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Ratings as Program<Ratings>;
  const provider = anchor.AnchorProvider.env();

  // Test users
  const user1 = anchor.web3.Keypair.generate();
  const user2 = anchor.web3.Keypair.generate();
  
  const projectId = new anchor.BN(12345);

  before(async () => {
    // Airdrop SOL to test users
    await provider.connection.requestAirdrop(user1.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(user2.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    
    // Wait for airdrops to confirm
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  it("Initializes a project rating", async () => {
    const [projectRatingPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("project_rating"), projectId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    await program.methods
      .initializeProjectRating(projectId)
      .accounts({
        projectRating: projectRatingPda,
        user: user1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user1])
      .rpc();

    const projectRating = await program.account.projectRating.fetch(projectRatingPda);
    
    expect(projectRating.projectId.toString()).to.equal(projectId.toString());
    expect(projectRating.totalRating.toString()).to.equal("0");
    expect(projectRating.totalVotes.toString()).to.equal("0");
    expect(projectRating.averageRating).to.equal(0);
  });

  it("Submits a rating", async () => {
    const [projectRatingPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("project_rating"), projectId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [userRatingPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_rating"), user1.publicKey.toBuffer(), projectId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    await program.methods
      .submitRating(5) // 5-star rating
      .accounts({
        projectRating: projectRatingPda,
        userRating: userRatingPda,
        user: user1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user1])
      .rpc();

    const projectRating = await program.account.projectRating.fetch(projectRatingPda);
    const userRating = await program.account.userRating.fetch(userRatingPda);
    
    expect(projectRating.totalRating.toString()).to.equal("5");
    expect(projectRating.totalVotes.toString()).to.equal("1");
    expect(projectRating.averageRating).to.equal(5.0);
    
    expect(userRating.rating).to.equal(5);
    expect(userRating.hasRated).to.equal(true);
    expect(userRating.user.toString()).to.equal(user1.publicKey.toString());
  });

  it("Submits multiple ratings and calculates average", async () => {
    const [projectRatingPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("project_rating"), projectId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [userRating2Pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_rating"), user2.publicKey.toBuffer(), projectId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // User 2 submits a 3-star rating
    await program.methods
      .submitRating(3)
      .accounts({
        projectRating: projectRatingPda,
        userRating: userRating2Pda,
        user: user2.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user2])
      .rpc();

    const projectRating = await program.account.projectRating.fetch(projectRatingPda);
    
    expect(projectRating.totalRating.toString()).to.equal("8"); // 5 + 3
    expect(projectRating.totalVotes.toString()).to.equal("2");
    expect(projectRating.averageRating).to.equal(4.0); // (5 + 3) / 2 = 4.0
  });

  it("Updates existing rating", async () => {
    const [projectRatingPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("project_rating"), projectId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [userRatingPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_rating"), user1.publicKey.toBuffer(), projectId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // User 1 updates their rating from 5 to 2
    await program.methods
      .submitRating(2)
      .accounts({
        projectRating: projectRatingPda,
        userRating: userRatingPda,
        user: user1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user1])
      .rpc();

    const projectRating = await program.account.projectRating.fetch(projectRatingPda);
    const userRating = await program.account.userRating.fetch(userRatingPda);
    
    expect(projectRating.totalRating.toString()).to.equal("5"); // 2 + 3 (user1 updated, user2 unchanged)
    expect(projectRating.totalVotes.toString()).to.equal("2"); // Still 2 votes
    expect(projectRating.averageRating).to.equal(2.5); // (2 + 3) / 2 = 2.5
    
    expect(userRating.rating).to.equal(2); // Updated rating
  });

  it("Rejects invalid ratings", async () => {
    const [projectRatingPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("project_rating"), projectId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [userRatingPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_rating"), user1.publicKey.toBuffer(), projectId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    try {
      await program.methods
        .submitRating(6) // Invalid rating (> 5)
        .accounts({
          projectRating: projectRatingPda,
          userRating: userRatingPda,
          user: user1.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user1])
        .rpc();
      
      expect.fail("Should have thrown an error for invalid rating");
    } catch (error) {
      expect(error.message).to.include("Rating must be between 1 and 5");
    }
  });
});
