# 🏆 Toxic Telegram Voting & Contest Bot (Bots.Business Engine)

> **Official Telegram Voting & Giveaway Contest Bot Engine** — Bots.Business (BB) BJS format me fully optimized, dynamic, anti-cheat protected aur real-time channel sync features ke saath.
>
> 👤 **Owner ID:** `8710308658`  
> 👨‍💻 **Developer:** [@codevexa](https://t.me/codevexa)  
> 📦 **Repo:** `https://github.com/Botsmasters-pkg/voting.git` (`main` branch)

---

## 📑 Table of Contents (Index)
1. [🌟 Bot Architecture Overview](#-bot-architecture-overview)
2. [🗳️ Real-Time Vote System (Channel Sync)](#️-real-time-vote-system-channel-sync)
3. [🎯 Complete Functional Flows (Step-by-Step)](#-complete-functional-flows-step-by-step)
   - [Flow 1: User /start & Force-Sub Verification](#flow-1-user-start--force-sub-verification)
   - [Flow 2: Contest Creation Wizard](#flow-2-contest-creation-wizard)
   - [Flow 3: Participant Entry (Join Contest)](#flow-3-participant-entry-join-contest)
   - [Flow 4: Voting & Channel Membership Enforcement](#flow-4-voting--channel-membership-enforcement)
   - [Flow 5: Live Vote Modification (Add/Remove Votes)](#flow-5-live-vote-modification-addremove-votes)
   - [Flow 6: Channel Sync Self-Healing Engine](#flow-6-channel-sync-self-healing-engine)
   - [Flow 7: Contest Ending & Auto-Timer Winner Announcement](#flow-7-contest-ending--auto-timer-winner-announcement)
4. [⚙️ Force Sub (F-Sub) Management Suite](#️-force-sub-f-sub-management-suite)
5. [🛡️ Security, Anti-Cheat & Strict Rules](#️-security-anti-cheat--strict-rules)
6. [🛠️ Admin Control Suite & Tools](#️-admin-control-suite--tools)
7. [📁 Command Files & Directory Structure](#-command-files--directory-structure)
8. [🚀 Deployment & Bots.Business (BB) Setup Guide](#-deployment--botsbusiness-bb-setup-guide)

---

## 🌟 Bot Architecture Overview

Yeh bot Bots.Business platform ke asynchronous event-driven BJS (Bot JavaScript) engine par bana hai. Isme kisi bhi hardcoded username ka upyog nahi kiya gaya hai — bot token ke zariye `Api.getMe` se apna username dynamically detect karta hai, jisse yeh `/41` clone command ke liye 100% compatible hai.

---

## 🗳️ Real-Time Vote System (Channel Sync)

Is bot ka sabse powerful feature hai **Real-Time Channel Button Sync**.

### 1. Vote Badhna / Ghatna (Instant Live Update):
* **Normal User Voting:**
  Jab koi voter channel me post hue participant card ke `[Vote - X]` button par click karta hai:
  1. Bot voter ki channel membership check karta hai.
  2. Vote verify hote hi channel message ka button **usi second** edit hokar `[Vote - (X+1)]` ho jata hai.
* **Admin / Creator Add Votes (`ADD VOTES`):**
  Jab creator ya admin management panel se kisi user ke vote badhata hai (Example: `8805712913 1000` ya `11222`):
  1. Database me user ke vote count update ho jate hain (`New Total: 11222`).
  2. Bot Telegram channel me post hue participant card ke message ID ko target karta hai.
  3. `Api.editMessageReplyMarkup` call karke **usi time par** channel ke button ko `[Vote - 11222]` me badal deta hai!
* **Admin / Creator Remove Votes (`REMOVE VOTES`):**
  Jab creator ya admin votes ghatata hai (Example: `8805712913 500`):
  1. Database me vote subtract ho jate hain (`New Total: 10722`).
  2. Channel ke button me vote **usi time par** ghat jata hai (`[Vote - 10722]`)!

---

## 🎯 Complete Functional Flows (Step-by-Step)

```
[User /start] ──► [Force-Sub Check] ──► [Welcome Menu]
                         │                       │
                (Not Joined)            ┌────────┴────────┐
                         │              ▼                 ▼
                  [Join Channels]    [CREATE]          [MANAGE]
                         │              │                 │
                  [Click VERIFY]        ▼                 ▼
                         │        (Step 1: Channel)   [Add/Remove Votes]
                         ▼              │                 │
                  [Welcome Menu]  (Step 2: Title)         ▼
                                        │          [Real-time Channel
                                  (Step 3: Timer)    Button Update]
                                        │
                                        ▼
                                [Announce in Channel]
```

### Flow 1: User /start & Force-Sub Verification
1. User `/start` send karta hai.
2. Bot check karta hai ki user ban hai ya nahi (`banned_users`). Agar banned hai toh access block ho jata hai.
3. Bot F-Sub channels check karta hai:
   - Agar F-Sub ON hai aur user ne channels join nahi kiye hain:
     - Bot **3x3 grid** me primary blue **`[JOIN]`** buttons aur bottom me green **`[✅ VERIFY]`** button show karta hai.
     - Referral parameters (`pending_start_params`) session me safe save rehte hain.
4. User channels join karke **`[✅ VERIFY]`** button dabata hai:
   - Bot har channel ki membership step-by-step asynchronously check karta hai (`run_after: 0.1` delay ke saath taaki sub-command recursion limit na aaye).
   - **Request Channel Feature:** Agar channel join-request type hai, toh pending request ko bina admin approval ke turant **VERIFIED** maan liya jata hai.
   - Verification complete hote hi user ko bina dobara command likhe **automatic Welcome Menu** display hota hai!

---

### Flow 2: Contest Creation Wizard
Contest create karne ka pura flow 3 clear steps me structured hai:

* **Step 1: Channel Input (`step_giveaway_channel.js`)**
  - User se Channel ka username (`@MyChannel`), invite link, ya Chat ID (`-100...`) maanga jata hai.
  - **Bot Username Protection:** Agar user galti se bot ka username (`@TOXICVOTESBOT` ya koi bhi `*bot` handle) daalta hai, toh bot use wahi rokk kar warning deta hai (kyunki bot kisi bot ko message nahi bhej sakta).
  - **1 Active Contest Rule:** Agar us channel me pehle se koi contest active chal raha hai, toh bot naya contest create nahi karne deta. Puraana contest END hone ke baad hi naya create ho sakta hai.
  - Channel validate hote hi channel auto-connect ho jata hai aur Step 2 prompt hota hai.
* **Step 2: Title / Prize Description (`step_giveaway_title.js`)**
  - User contest ka title ya prize likhkar bhejta hai (Example: `🎁 Photo Contest 2026 - Winner ₹1000`).
  - **Echo-Safe State Machine:** Step 1 ka channel input galti se title na ban jaye, iske liye input verification aur wildcard state handling lagi hui hai.
* **Step 3: Contest Duration / Timer (`step_giveaway_duration.js`)**
  - User ko interactive duration buttons milte hain:
    - `[⚡ 1 Hour]`
    - `[🕒 6 Hours]`
    - `[⏳ 12 Hours]`
    - `[📅 24 Hours (1 Day)]`
    - `[📆 3 Days]`
    - `[♾ No Timer (Manual)]`
  - Duration select karte hi:
    1. Contest database me save ho jata hai.
    2. Bot channel me official announcement post karta hai jisme `[🎯 Join Contest]` button laga hota hai.
    3. Agar timer set kiya gaya hai, toh auto-end timer schedule ho jata hai.

---

### Flow 3: Participant Entry (Join Contest)
1. Contestant channel me announcement post par lage **`[🎯 Join Contest]`** button par click karta hai.
2. Bot contestant ko PM me le jata hai aur contest verify karta hai.
3. **Single Entry Guard:** Ek contestant ek contest me sirf **1 baar** participate kar sakta hai. Dobara click karne par uska personal referral link aur current votes dikhaye jaate hain.
4. Pehli baar participate karne par:
   - Contestant ka name, username, aur Telegram ID register hoti hai.
   - Channel me contestant ka official Card post hota hai:
     ```
     🎯 NEW PARTICIPANT JOINED!
     🏆 Prize: Netflix checker
     👤 Name: DND
     🆔 ID: 8805712913
     📍 Username: @username

     Vote karne ke liye neeche button dabao! 👇
     [Vote - 0]
     ```
   - **Post Callback Tracking:** `on_participant_post_saved` callback ke zariye is message ka Telegram `message_id` turant database me `giveaway.vote_messages[uid]` me permanently store ho jata hai.
   - Participant ko uska personal referral share link milta hai:
     `https://t.me/BotUsername?start=vote_<GID>_<UID>`

---

### Flow 4: Voting & Channel Membership Enforcement
1. **Vote Button Tap:**
   Koi bhi user channel me bane `[Vote - X]` button par ya referral link se PM me vote button par tap karta hai.
2. **Instant Self-Heal Caching:**
   Jaise hi channel button tap hota hai, bot turant channel message ka `message_id` capture karke database me link kar deta hai aur button ko live vote count se refresh kar deta hai.
3. **Anti-Cheat Guards:**
   - **Ban Check:** Banned users vote nahi kar sakte.
   - **Self-Vote Guard:** User khud ko vote nahi de sakta (`Aap khud ko vote nahi kar sakte!`).
   - **Cross-Vote Guard:** Contest ke participants ek-doosre ko vote nahi de sakte (sirf public voters vote de sakte hain).
   - **Duplicate Vote Guard:** 1 voter 1 participant ko sirf 1 vote de sakta hai.
4. **Channel Membership Check:**
   - Bot Telegram API se check karta hai ki voter contest wale channel ka member hai ya nahi.
   - **Frictionless 1-Tap PM Prompt:** Agar voter ne channel join nahi kiya hai, toh bot use private chat me guide karta hai:
     - `[📢 Step 1: Join Channel]`
     - `[🗳 Step 2: Cast Vote Now]`
   - **Permanent Retention:** Ek baar voter ne channel join karke vote de diya, uske baad agar voter channel **LEAVE bhi kar deta hai**, toh bhi uska vote contest me **permanently safe rahega** (vote cancel nahi hoga).
5. **Vote Success:**
   - Database me vote count `+1` ho jata hai.
   - Channel me participant card ka button usi second update hokar `[Vote - (X+1)]` ban jata hai!

---

### Flow 5: Live Vote Modification (Add/Remove Votes)
Contest creator ya bot owner kisi bhi participant ke votes manually badha ya ghata sakte hain:
1. `/start` > `MANAGE` > Contest select karein (`MANAGEMENT PANEL`).
2. **`[ADD VOTES]` dabayein:**
   - Bot poochta hai: `Send: USER_ID VOTES` (Example: `8805712913 1000`).
   - User reply bhejta hai.
   - Bot database me `+1000` votes add karta hai (`New Total: 1000`).
   - Channel me participant ke message ID par `editMessageReplyMarkup` call hota hai aur button turant `[Vote - 1000]` ho jata hai!
3. **`[REMOVE VOTES]` dabayein:**
   - Bot poochta hai: `Send: USER_ID VOTES` (Example: `8805712913 500`).
   - Bot database me se votes subtract karta hai.
   - Channel me message button usi second `[Vote - 500]` par update ho jata hai!

---

### Flow 6: Channel Sync Self-Healing Engine
Agar kisi purane contest me message ID link na ho payi ho:
1. **Automatic Self-Healing on Tap:** Channel me koi bhi user jaise hi us participant ke `Vote` button par tap karega, bot bina error throw kiye uska Telegram `message_id` instantly capture karke database me map kar deta hai aur button text ko live vote count se update kar deta hai.
2. **`[🔄 SYNC CHANNEL]` Button:** Management panel me naya sync button diya gaya hai. Is par click karte hi bot channel me maujood sabhi participants ke buttons ko live scan karke database vote count se sync kar deta hai.

---

### Flow 7: Contest Ending & Auto-Timer Winner Announcement
Contest do tareeqon se end hota hai:
1. **Manual End (`END GIVEAWAY` button):** Creator ya owner management panel se manually contest end kar sakte hain.
2. **Auto-Timer End (`cmd_auto_end_giveaway.js`):** Agar contest create karte waqt duration (jaise 1h, 24h) set ki gayi thi, toh time expire hote hi timer trigger hota hai.

**Result Processing:**
- Sabhi participants ke votes calculate karke highest votes wale ko **WINNER** declare kiya jata hai.
- Channel me official announcement post ki jaati hai:
  ```
  ⏰ TIME'S UP! CONTEST CONCLUDED! 🏆
  🎯 Contest: Netflix checker
  📌 Contest ID: #G123456
  🏆 WINNER: DND with 11222 votes!
  🎉 Heartiest congratulations to the winner!
  ```
- Contest status `ENDED` mark ho jata hai. Channel ab naye contest ke liye free ho jata hai.

---

## ⚙️ Force Sub (F-Sub) Management Suite

Admin panel (`/admin` > `FORCE SUB CHANNELS`) se multi-channel subscription control kiya ja sakta hai:

1. **Channels List & Status:** Total channels count, individual channel type badge (`🌐 PUBLIC`, `🔒 PRIVATE`, `🟡 REQUEST`), aur direct clickable links.
2. **2-Step Addition for Private & Request Channels:**
   - **Step 1:** Bot pehle Channel ka **Chat ID** maangta hai (`-100...`).
   - **Step 2:** Chat ID verify hone ke baad bot channel ka **Invite / Request Link** maangta hai.
   - Chat ID aur Link alag-alag validate hote hain.
3. **Instant Approval for Join Request Channels:**
   - Agar channel join-request mode me hai, toh user ke request send karte hi bot use **VERIFIED** accept kar leta hai bina admin approval ka wait kiye.
4. **Interactive Deletion:** Red danger buttons se kisi bhi channel ko single tap me remove kiya ja sakta hai.
5. **Instant Toggle:** Single click me Force Sub feature ko pure bot me `ON` ya `OFF` kiya ja sakta hai.
6. **Anti-Recursion (`run_after: 0.1`):** Sub-commands chain depth ko 2 se kam rakha gaya hai taaki Bots.Business ka "Too many sub commands: more then 5" error kabhi na aaye.

---

## 🛡️ Security, Anti-Cheat & Strict Rules

| Rule | Description |
|---|---|
| **1 Active Contest Per Channel** | Ek Telegram channel me ek samay par sirf ek hi contest active chal sakta hai. Puraana contest END hone par hi naya start hoga. |
| **No Bot as Channel** | Contest creation me bot ka apna username ya koi bhi `*bot` username allow nahi hai (Error 403 Forbidden protection). |
| **Banned User Protection** | Banned users bot `/start` nahi kar sakte, contest join nahi kar sakte, aur vote nahi de sakte. |
| **No Self-Voting** | Participant khud ko vote nahi de sakta. |
| **No Cross-Voting** | Contest participants ek-doosre ko vote nahi de sakte (anti-collusion). |
| **Single Entry Guard** | Participant ek contest me sirf 1 baar card post kar sakta hai. Duplicate card creation completely blocked hai. |
| **Permanent Vote Retention** | Voter agar channel join karne ke baad channel leave kar deta hai, tab bhi uska vote cancel nahi hoga. |

---

## 🛠️ Admin Control Suite & Tools

`/admin` command se access hone wale tools:
* **📊 System Stats:** Total Users, Total Votes Cast, Total Contests Created, Connected Channels, Banned Users count.
* **📢 Broadcast:** Sabhi bot users ko single click me HTML formatted mass announcement send karna.
* **🚫 Ban / Unban System:** Kisi bhi Telegram ID ko instantly bot se ban ya unban karna.
* **🌐 Channel Tools:** Connected channels ki list, Admin promote/demote, message delete tool, aur invite link retrieval.
* **🎁 1-Click Bot Clone (`/41`):**
  - Command: `/41 your_email@gmail.com`
  - User ke Bots.Business account me bot ka full clone automatically install ho jata hai.
  - User details aur notification instantly Admin ID (`8710308658`) par deliver hote hain.

---

## 📁 Command Files & Directory Structure

```text
commands/
├── _start.js                     <-- /start menu, deep-links & F-sub lock screen
├── _admin.js                     <-- /admin command dashboard (Owner only)
├── _41.js                        <-- /41 bot clone installer
├── _wildcard.js                  <-- Wildcard callback router & conversational state machine
├── create_giveaway.js            <-- Contest creation Step 1 trigger
├── step_giveaway_channel.js      <-- Channel input validation & 1-contest check
├── step_giveaway_title.js        <-- Contest prize/title processor
├── step_giveaway_duration.js     <-- Timer selector, auto-end schedule & channel post
├── cmd_auto_end_giveaway.js      <-- Timer expiration & automatic winner announcer
├── join_giveaway.js              <-- Contestant entry & participant card post
├── on_participant_post_saved.js  <-- Telegram message_id capture for real-time button sync
├── vote.js                       <-- Vote button handler & immediate message_id cache
├── on_vote_member_check.js       <-- Channel membership check & vote increment
├── on_vote_member_error.js       <-- Safe fallback error handler for voting
├── vote_referral.js              <-- Personal referral vote handler (?start=vote_GID_UID)
├── manage_giveaway.js            <-- Management Panel (Add/Remove votes, Leaderboard, End)
├── cmd_add_votes.js              <-- Add votes prompt
├── step_add_votes.js             <-- Process vote addition & update channel button
├── cmd_remove_votes.js           <-- Remove votes prompt
├── step_remove_votes.js          <-- Process vote reduction & update channel button
├── cmd_sync_giveaway.js          <-- Force-sync channel buttons with database
├── cmd_leaderboard.js            <-- Top 10 sorted leaderboard
├── cmd_end_giveaway.js           <-- Manual contest end & winner announcement
├── my_giveaways.js               <-- User contest list
├── my_stats.js                   <-- User profile statistics
├── how_it_works.js               <-- User guide
├── admin_fsub.js                 <-- Force Sub main panel
├── admin_fsub_list.js            <-- Force Sub channels list
├── admin_fsub_prompt.js          <-- Force Sub channel add prompt
├── step_fsub_add.js              <-- Add public channel
├── step_fsub_chat_id.js          <-- Step 1/2: Chat ID for private/request channel
├── step_fsub_link.js             <-- Step 2/2: Link for private/request channel
├── admin_fsub_remove.js          <-- Interactive channel deletion
├── admin_fsub_toggle.js          <-- F-Sub ON/OFF switch
├── fsub_verify.js                <-- Multi-channel membership verifier (run_after: 0.1)
├── fsub_check_result.js          <-- Membership API result processor
├── fsub_check_error.js           <-- Membership API error processor
├── fsub_verify_step.js           <-- Proxy delegator
├── admin_stats.js                <-- System statistics view
├── admin_broadcast.js            <-- Broadcast prompt
├── step_admin_broadcast.js       <-- Mass broadcast sender
├── admin_ban.js                  <-- Ban/Unban prompt
├── step_admin_ban.js             <-- Ban/Unban executor
├── channel_tools.js              <-- Channel management suite
└── ...                           <-- Channel admin promotion, demotion & link helpers
```

---

## 🚀 Deployment & Bots.Business (BB) Setup Guide

### Method 1: Git Sync (Recommended)
1. Is repository ko apne GitHub par sync karein:
   ```bash
   git remote add origin https://github.com/Botsmasters-pkg/voting.git
   git push -u origin main
   ```
2. **Bots.Business Web / App** (`app.bots.business`) me login karein.
3. Apna bot select karein > **Tools** > **Git Sync** me jaakar Git repository configure karein.
4. **Import from Git** button dabayein — sabhi 74 commands live sync ho jayenge!

### Method 2: Import ToxicVotingBot.bb
1. Root directory me maujood **`ToxicVotingBot.bb`** package ko Bots.Business bot editor me import karein.
2. Sabhi commands, headers (`need_reply`, `aliases`), aur BJS codes single click me load ho jayenge.

### Channel Permissions:
Bot ko contest channel me **Administrator** banayein aur yeh permissions dein:
- ✅ **Post Messages**
- ✅ **Edit Messages of Others**
- ✅ **Invite Users via Link**
