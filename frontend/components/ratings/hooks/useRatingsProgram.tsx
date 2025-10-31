"use client";

import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import bs58 from 'bs58';
import { useMemo, useCallback } from 'react';
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";

import { Ratings } from '../../../anchor-idl/ratings';
import ratingsIdl from '../../../anchor-idl/ratings.json';
import { withRpcRetry } from '../../../lib/rpc-utils';

export function useRatingsProgram() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  // Program initialization - conditionally create with provider if wallet connected
  const program = useMemo(() => {
    if (wallet) {
      // Create a provider with the wallet for transaction signing
      const provider = new anchor.AnchorProvider(connection, wallet, {
        preflightCommitment: "confirmed",
      });
      return new anchor.Program<Ratings>(ratingsIdl as Ratings, provider);
    } else {
      // Create program with just connection for read-only operations
      return new anchor.Program<Ratings>(ratingsIdl as Ratings, { connection });
    }
  }, [connection, wallet]);

  const getProjectRatingPDA = useCallback((projectId: number) => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('project_rating'), new BN(projectId).toArrayLike(Buffer, 'le', 8)],
      program.programId
    );
    return pda;
  }, [program.programId]);

  const getUserRatingPDA = useCallback((userPublicKey: PublicKey, projectId: number) => {
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('user_rating'),
        userPublicKey.toBuffer(),
        new BN(projectId).toArrayLike(Buffer, 'le', 8)
      ],
      program.programId
    );
    return pda;
  }, [program.programId]);

  const getUserTextReviewPDA = useCallback((userPublicKey: PublicKey, projectId: number) => {
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('text_review'),
        userPublicKey.toBuffer(),
        new BN(projectId).toArrayLike(Buffer, 'le', 8)
      ],
      program.programId
    );
    return pda;
  }, [program.programId]);

  const initializeProjectRating = useCallback(async (projectId: number) => {
    if (!publicKey) throw new Error('Wallet not connected');

    const projectRatingPDA = getProjectRatingPDA(projectId);

    return withRpcRetry(async () => {
      const tx = await program.methods
        .initializeProjectRating(new BN(projectId))
        .accountsPartial({
          projectRating: projectRatingPDA,
          user: publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      return tx;
    });
  }, [program, publicKey, getProjectRatingPDA]);

  const submitRating = useCallback(async (projectId: number, rating: number, reviewText?: string) => {
    console.log('🔵 [submitRating] Starting submission...');
    console.log('🔵 [submitRating] Parameters:', { projectId, rating, reviewText, reviewTextLength: reviewText?.length });
    
    if (!publicKey) throw new Error('Wallet not connected');
    if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');
    if (reviewText && reviewText.length > 500) throw new Error('Review text must be 500 characters or less');

    const projectRatingPDA = getProjectRatingPDA(projectId);
    const userRatingPDA = getUserRatingPDA(publicKey, projectId);
    const textReviewPDA = getUserTextReviewPDA(publicKey, projectId);

    console.log('🔵 [submitRating] PDAs:', {
      projectRatingPDA: projectRatingPDA.toString(),
      userRatingPDA: userRatingPDA.toString(),
      textReviewPDA: textReviewPDA.toString(),
      user: publicKey.toString(),
      programId: program.programId.toString(),
    });

    const reviewTextValue = reviewText && reviewText.trim() ? reviewText.trim() : null;
    console.log('🔵 [submitRating] Review text value:', reviewTextValue);

    return withRpcRetry(async () => {
      try {
        console.log('🔵 [submitRating] Building instruction...');
        const instruction = program.methods
          .submitRating(new BN(projectId), rating, reviewTextValue)
          .accountsPartial({
            projectRating: projectRatingPDA,
            userRating: userRatingPDA,
            textReview: textReviewPDA,
            user: publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          });

        console.log('🔵 [submitRating] Simulating transaction...');
        const simulateResult = await instruction.simulate();
        console.log('🔵 [submitRating] Simulation result:', simulateResult);

        console.log('🔵 [submitRating] Sending transaction...');
        const tx = await instruction.rpc();
        console.log('🔵 [submitRating] Transaction successful:', tx);
        return tx;
      } catch (error: unknown) {
        const errorObj = error as Record<string, unknown>;
        console.error('🔴 [submitRating] Error details:', {
          error,
          message: 'message' in errorObj ? errorObj.message : undefined,
          logs: 'logs' in errorObj ? errorObj.logs : undefined,
          code: 'code' in errorObj ? errorObj.code : undefined,
          errorCode: 'errorCode' in errorObj ? errorObj.errorCode : undefined,
          errorMessage: 'errorMessage' in errorObj ? errorObj.errorMessage : undefined,
          err: 'err' in errorObj ? errorObj.err : undefined,
          stack: 'stack' in errorObj ? errorObj.stack : undefined,
        });
        
        // Try to get more details from Anchor error
        if ('errorCode' in errorObj && errorObj.errorCode) {
          console.error('🔴 [submitRating] Anchor Error Code:', errorObj.errorCode);
        }
        if ('logs' in errorObj && errorObj.logs) {
          console.error('🔴 [submitRating] Program Logs:', errorObj.logs);
        }
        if ('simulationResponse' in errorObj && errorObj.simulationResponse) {
          console.error('🔴 [submitRating] Simulation Response:', errorObj.simulationResponse);
        }
        
        throw error;
      }
    });
  }, [program, publicKey, getProjectRatingPDA, getUserRatingPDA, getUserTextReviewPDA]);

  const getProjectRating = useCallback(async (projectId: number) => {
    const projectRatingPDA = getProjectRatingPDA(projectId);

    return withRpcRetry(async () => {
      const projectRating = await program.account.projectRating.fetch(projectRatingPDA);
      return {
        projectId: projectRating.projectId.toNumber(),
        totalRating: projectRating.totalRating.toNumber(),
        totalVotes: projectRating.totalVotes.toNumber(),
        averageRating: projectRating.averageRating,
        reviewCount: projectRating.reviewCount?.toNumber() || 0,
      };
    });
  }, [program, getProjectRatingPDA]);

  const getTextReviews = useCallback(async (projectId: number, maxCount?: number) => {
    try {
      console.log('🔵 [getTextReviews] Fetching reviews for project:', projectId);
      
      // Use getProgramAccounts with filters
      const programId = program.programId;
      const projectIdBuffer = new BN(projectId).toArrayLike(Buffer, 'le', 8);
      
      console.log('🔵 [getTextReviews] Program ID:', programId.toString());
      console.log('🔵 [getTextReviews] Project ID buffer:', projectIdBuffer);
      
      // Get all accounts owned by the program
      const accounts = await connection.getProgramAccounts(programId, {
        filters: [
          {
            dataSize: 8 + 32 + 8 + 4 + 500 + 8, // discriminator + user + project_id + string prefix + max string + timestamp
          },
          {
            memcmp: {
              offset: 8 + 32, // Skip discriminator (8) + user (32), to get to project_id
              bytes: bs58.encode(projectIdBuffer),
            },
          },
        ],
      });

      console.log('🔵 [getTextReviews] Found accounts:', accounts.length);

      const reviews = await Promise.all(
        accounts.map(async (accountInfo) => {
          try {
            const account = program.coder.accounts.decode('textReview', accountInfo.account.data);
            return {
              user: account.user.toString(),
              projectId: account.projectId.toNumber(),
              reviewText: account.reviewText,
              timestamp: account.timestamp.toNumber(),
            };
          } catch (error) {
            console.error('🔴 [getTextReviews] Error decoding account:', error);
            return null;
          }
        })
      );

      const validReviews = reviews
        .filter((review): review is NonNullable<typeof review> => review !== null)
        .slice(0, maxCount || reviews.length)
        .sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first

      console.log('🔵 [getTextReviews] Valid reviews:', validReviews.length);
      return validReviews;
    } catch (error) {
      console.error('🔴 [getTextReviews] Error fetching text reviews:', error);
      return [];
    }
  }, [program, connection]);

  const getUserRating = useCallback(async (userPublicKey: PublicKey, projectId: number) => {
    const userRatingPDA = getUserRatingPDA(userPublicKey, projectId);

    return withRpcRetry(async () => {
      const userRating = await program.account.userRating.fetch(userRatingPDA);
      return {
        user: userRating.user.toString(),
        projectId: userRating.projectId.toNumber(),
        rating: userRating.rating,
        hasRated: userRating.hasRated,
        timestamp: userRating.timestamp.toNumber(),
      };
    });
  }, [program, getUserRatingPDA]);

  return {
    program,
    publicKey,
    connected,
    connection,
    initializeProjectRating,
    submitRating,
    getProjectRating,
    getUserRating,
    getTextReviews,
    getProjectRatingPDA,
    getUserRatingPDA,
    getUserTextReviewPDA,
  };
}
