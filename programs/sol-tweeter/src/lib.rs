use anchor_lang::prelude::*;
use Clock;
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod sol_tweeter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let blog_account = &mut ctx.accounts.blog_account;
        blog_account.author = *ctx.accounts.signer.key;
        Ok(())
    }

    pub fn post_tweet(ctx: Context<PostTweet>, title: String, content: String) -> Result<()> {
        let tweets: &mut Vec<Pubkey> = &mut ctx.accounts.blog_account.tweets;
        let author: &Signer = &ctx.accounts.author;
        let clock: Clock = Clock::get().unwrap();

        let tweet: &mut Account<Tweet> = &mut ctx.accounts.tweet;

        tweet.title = title;
        tweet.content = content;
        tweet.author = author.key();
        tweet.timestamp = clock.unix_timestamp;

        let tweet_pubkey = tweet.key();

        tweets.push(tweet_pubkey);

        Ok(())
    }

    pub fn edit_tweet(ctx: Context<EditTweet>, title: String, content: String) -> Result<()> {
        let tweet_to_edit = &mut ctx.accounts.tweet;
        let clock: Clock = Clock::get().unwrap();
        tweet_to_edit.title = title;
        tweet_to_edit.content = content;
        tweet_to_edit.timestamp = clock.unix_timestamp;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init,payer=signer,space=8+32+32+500)]
    pub blog_account: Account<'info, BlogAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PostTweet<'info> {
    #[account(init,payer=author,space= 8+120+500+32+32)]
    pub tweet: Account<'info, Tweet>,
    #[account(mut)]
    pub blog_account: Account<'info, BlogAccount>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EditTweet<'info> {
    #[account(mut,has_one=author)]
    pub tweet: Account<'info, Tweet>,
    pub author: Signer<'info>,
}

#[account]
pub struct BlogAccount {
    pub address: Pubkey,
    pub author: Pubkey,
    pub tweets: Vec<Pubkey>,
}

#[account]
pub struct Tweet {
    pub title: String,
    pub content: String,
    pub author: Pubkey,
    pub timestamp: i64,
}
