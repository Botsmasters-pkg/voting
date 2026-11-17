# 🤖 Nobita Voting & Contest Bot for Bots.Business (BB)

Ye bot aapke Python bot (`NobitaVotBot.py`) ko **Bots.Business (BB)** platform ke **BJS (Bot JavaScript)** format me convert karke banaya gaya hai.

---

## 📁 File Structure

```text
├── NobitaVotingBot.bb              <-- Single-file (.bb) bundle jisme sabhi commands aur BJS code bundled hai
├── bot.json                        <-- Bots.Business Git Sync configuration
└── commands/                       <-- Sabhi BJS command files
    ├── _start.js                   <-- /start menu aur deep-linking
    ├── create_giveaway.js          <-- Contest create karne ka wizard
    ├── step_giveaway_channel.js    <-- Channel input validation
    ├── step_giveaway_title.js      <-- Contest title & announcement publish
    ├── on_channel_post_success.js  <-- Success handler
    ├── on_channel_post_error.js    <-- Error handler
    ├── join_giveaway.js            <-- Participant entry & channel card creation
    ├── vote.js                     <-- Voting processor & anti-cheat check
    ├── on_vote_member_check.js     <-- Channel membership verify & live counter update
    ├── on_vote_member_error.js     <-- Fallback vote handler
    ├── my_giveaways.js             <-- User ke banaye contests ki list
    ├── my_stats.js                 <-- User profile statistics
    ├── how_it_works.js             <-- Bot usage guide
    ├── _admin.js                   <-- /admin dashboard (Owner only)
    ├── admin_stats.js              <-- Platform overview & total stats
    ├── admin_broadcast.js          <-- Broadcast prompt
    ├── step_admin_broadcast.js     <-- Mass message sender
    ├── admin_ban.js                <-- Ban/Unban user prompt
    └── step_admin_ban.js           <-- Ban/Unban processor
```

---

## 🚀 Bots.Business (BB) par kaise run karein?

Bots.Business par bot run karne ke **3 aasan tareeqe** hain:

### Method 1: Git Sync (Sabse Best & Recommended)
1. Ek **GitHub** repository banayein (e.g., `nobita-voting-bb`).
2. Is folder ke sabhi files (`bot.json` aur `commands/` folder) ko us repository me push kar dein.
3. **Bots.Business App / Web** (`app.bots.business`) me login karein.
4. Apna bot select karein > **Tools** > **Git Sync** > **Configure Git** me jaakar apni GitHub repo ka URL dalein.
5. GitHub deploy key configure karein aur **Import from Git** button dabayein!
6. Sabhi commands automatically Bots.Business me import ho jayenge!

---

### Method 2: Bots.Business App / Web me Direct Commands banana
Agar aap Git use nahi karna chahte, to aap Bots.Business App me directly commands bana sakte hain:
1. Bots.Business app open karein.
2. **Commands** tab me jayein aur `+` (New Command) par click karein.
3. `commands/` folder me se har file ka code copy-paste karein:
   - Header me jo `command:` likha hai, wo Command name me dalein.
   - Baki ka JavaScript code **BJS (Bot JavaScript)** box me paste karein.
   - `need_reply: true` wale commands me "Need reply" tick karein.

---

### Method 3: VS Code Extension se 1-Click Sync
1. VS Code me **Bots.Business** extension install karein.
2. `Bots.Business: Login` karein.
3. Is folder ko open karke `Bots.Business: Set Bot ID` se apne bot ko link karein.
4. Har save par aapka code live Bots.Business me sync ho jayega.

---

## ⚙️ Configuration & Setup
1. **Bot Token:** Telegram par [@BotFather](https://t.me/BotFather) se new bot banayein aur uska token Bots.Business me bot create karte time enter karein.
2. **Owner ID Change karein:**
   - `commands/_start.js` aur `commands/_admin.js` me line 7 par apna Telegram Numeric User ID dalein:
     ```javascript
     var OWNER_ID = 5985856756; // Apna ID yahan dalein
     ```
3. **Channel Setup:**
   - Bot ko apne contest wale Telegram Channel me **Administrator** banayein.
   - Bot ko **Post Messages** aur **Edit Messages** ki permissions zaroor dein taaki wo participant cards aur live vote counter update kar sake.

---

## ✨ Main Features
- 🗳 **Real-time Live Vote Counter:** Channel me vote button par click karte hi vote count update hota hai (`Vote - 1`, `Vote - 2`...).
- 🛡 **Anti-Cheat:** 1 user 1 participant ko sirf 1 bar vote de sakta hai.
- 📢 **Force-Join Check:** Bot check karta hai ki voter channel ka subscriber hai ya nahi.
- 📊 **Contest Management:** Users apne active aur ended contests dekh sakte hain.
- ⚡ **Admin Dashboard:** Total users, total votes, mass broadcast, aur bad users ko ban karne ka feature.
