import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { expect } from "chai";
import { SolTweeter } from "../target/types/sol_tweeter";

const { SystemProgram } = anchor.web3;
import { TransactionInstruction } from "@solana/web3.js";
describe("sol-tweeter", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.SolTweeter as Program<SolTweeter>;
  const blog_account = anchor.web3.Keypair.generate();
  const tweet_account = anchor.web3.Keypair.generate();
  const provider = anchor.getProvider();
  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({
      accounts: {
        blogAccount: blog_account.publicKey,
        signer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [blog_account],
    });

    expect(tx).to.not.be.null;
  });

  it("Successfully creates a new tweet", async () => {
    const demo_tweet = {
      title: "Test",
      content: "Test content to see if we can tweet",
    };

    const tx = await program.rpc.postTweet(
      demo_tweet.title,
      demo_tweet.content,
      {
        accounts: {
          tweet: tweet_account.publicKey,
          blogAccount: blog_account.publicKey,
          author: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [tweet_account],
      }
    );
    const blog_account_fetched = await program.account.blogAccount.fetch(
      blog_account.publicKey
    );

    const tweet_account_fetched = await program.account.tweet.fetch(
      blog_account_fetched.tweets[0]
    );

    expect(tweet_account_fetched.title).to.equal(demo_tweet.title);
    expect(tweet_account_fetched.content).to.equal(demo_tweet.content);
    expect(blog_account_fetched.tweets.length === 1);
  });

  it("Successfully edits an old tweet", async () => {
    const demo_tweet = {
      title: "Test updated",
      content: "Test updated content to see if we can edit tweet",
    };

    const tx = await program.rpc.editTweet(
      demo_tweet.title,
      demo_tweet.content,
      {
        accounts: {
          tweet: tweet_account.publicKey,
          author: provider.wallet.publicKey,
        },
      }
    );
    const blog_account_fetched = await program.account.blogAccount.fetch(
      blog_account.publicKey
    );

    const tweet_account_fetched = await program.account.tweet.fetch(
      blog_account_fetched.tweets[0]
    );

    expect(tweet_account_fetched.title).to.equal(demo_tweet.title);
    expect(tweet_account_fetched.content).to.equal(demo_tweet.content);
    expect(blog_account_fetched.tweets.length === 1);
  });
});
