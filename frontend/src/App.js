import "./App.css";
import { useState, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";
import { GROUP_CONTRACT_ADDRESS, GROUP_CONTRACT_ABI } from "./groupContract";

function App() {
  const [screen, setScreen] = useState("welcome");
  const [nickname, setNickname] = useState("");
  const [tempName, setTempName] = useState("");

  const [challengeName, setChallengeName] = useState("");
  const [challengeDuration, setChallengeDuration] = useState("");
  const [challengeFee, setChallengeFee] = useState("");
  const [challenges, setChallenges] = useState([]);

  const [joinPassword, setJoinPassword] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challengePassword, setChallengePassword] = useState(""); 
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [groupScreen, setGroupScreen] = useState("menu"); 
  const [searchId, setSearchId] = useState("");

  const [activeLobby, setActiveLobby] = useState(null);
  const [userWalletAddress, setUserWalletAddress] = useState("");

  // SOLO STREAK ODVOJENO
  const [days, setDays] = useState(0);
  const [saved, setSaved] = useState(0);


  const [badges, setBadges] = useState([]); 
  const [archivedBadges, setArchivedBadges] = useState([]);
  const [newBadge, setNewBadge] = useState(null);

  const [loading, setLoading] = useState(false); 
  const [isLoaded, setIsLoaded] = useState(false); 

  const [lobbyProgress, setLobbyProgress] = useState({});

  const milestones = [1, 7, 15, 30, 60];
  
  const [fadeOut, setFadeOut] = useState(false); 

  const slipText = [
  "Slipped once",
  "Slipped twice",
  "Slipped several times",
  "Slipped many times",
  "Slipped often",
];

 useEffect(() => { 
  const savedDays = sessionStorage.getItem("days"); 
  const savedMoney = sessionStorage.getItem("saved");
  const savedName = sessionStorage.getItem("nickname");
  const savedArchived = sessionStorage.getItem("archivedBadges");
  const savedLobbyProgress = sessionStorage.getItem("lobbyProgress");

  if (savedDays !== null) setDays(Number(savedDays)); 
  if (savedMoney !== null) setSaved(Number(savedMoney));

  if (savedArchived) setArchivedBadges(JSON.parse(savedArchived));
  if (savedLobbyProgress) setLobbyProgress(JSON.parse(savedLobbyProgress));

  if (savedName) { 
    setNickname(savedName);
    setScreen("modeSelect");
  }

  if (window.ethereum && window.ethereum.selectedAddress) {
    setUserWalletAddress(window.ethereum.selectedAddress.toLowerCase());
  }

  setIsLoaded(true);
  }, []);

  useEffect(() => { 
  if (!isLoaded) return;

  sessionStorage.setItem("days", days);
  sessionStorage.setItem("saved", saved);
  sessionStorage.setItem("nickname", nickname);
  sessionStorage.setItem("archivedBadges", JSON.stringify(archivedBadges));
  sessionStorage.setItem("lobbyProgress", JSON.stringify(lobbyProgress));

  }, [days, saved, nickname, archivedBadges, lobbyProgress, isLoaded]);

  function getChallengeContract(signerOrProvider) {
    return new ethers.Contract(GROUP_CONTRACT_ADDRESS, GROUP_CONTRACT_ABI, signerOrProvider);
  }
 
  function getGroupContract(signerOrProvider) {
  return new ethers.Contract(
    GROUP_CONTRACT_ADDRESS,
    GROUP_CONTRACT_ABI,
    signerOrProvider
  );
}

  function validatePassword(pwd) {
    if (pwd.length !== 5) return false;
    const digitsCount = (pwd.match(/\d/g) || []).length;
    return digitsCount === 3;
  }

  async function connectWallet() {
    const provider = await detectEthereumProvider();
    if (!provider) {
      alert("Install MetaMask");
      return;
    }
    await window.ethereum.request({ method: "eth_requestAccounts" }); 
    setUserWalletAddress(window.ethereum.selectedAddress.toLowerCase());

    const savedName = sessionStorage.getItem("nickname");
    if (savedName) {
      setNickname(savedName);
      setScreen("modeSelect");
    } else {
      setScreen("nickname");
    }
  }

  function saveName() {
    if (!tempName.trim()) {
      alert("Upiši nadimak");
      return;
    }
    setNickname(tempName); 
    setScreen("modeSelect");
  }

  const currentLobbyData = activeLobby
  ? lobbyProgress[activeLobby.id] || { days: 0, active: true, finished: false }
  : { days: 0, active: true, finished: false };

  const [members, setMembers] = useState([]);
  useEffect(() => {
  if (!activeLobby?.id) return;

  loadMembers(activeLobby.id); // initial load

  const interval = setInterval(() => {
    loadMembers(activeLobby.id); // refresh svakih 5 sekundi
  }, 5000);

  return () => clearInterval(interval);
  }, 
  [activeLobby?.id, userWalletAddress]);


  async function loadMembers(lobbyId) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = getGroupContract(provider);

    const addresses = await contract.getParticipants(lobbyId);

    const lobby = await contract.getChallenge(lobbyId);
    const groupDays = Number(lobby[7]); // ili contract field koji drži progress

    const mapped = addresses.map((addr) => ({
      address: addr,
      name:
    addr.toLowerCase() === userWalletAddress
      ? nickname || "You"
      : addr.slice(0, 6) + "..." + addr.slice(-4),

      days: groupDays,
      status: "active"
      }));

    setMembers(mapped);
  } catch (err) {
    console.error(err);
  }
}

// grupni NFT samo ako SVI uspiju
  const didWholeGroupSucceed =
  currentLobbyData.finished &&
  members.every(m => m.status === "active");

  function handleGroupProgressUpdate() {
    if (!activeLobby) return;
    const lobbyId = activeLobby.id;
    const currentData = lobbyProgress[lobbyId] || { days: 0, active: true, finished: false };

    if (!currentData.active) {
      alert("You failed in this lobby! You cannot make more progress here.");
      return;
    }
    if (currentData.finished) return;

    const nextDays = currentData.days + 1;
    const maxDays = activeLobby.duration || 10;

    const updatedData = {
      ...currentData,
      days: nextDays >= maxDays ? maxDays : nextDays,
      finished: nextDays >= maxDays ? true : false
    };

         setLobbyProgress(prev => ({
      ...prev,
      [lobbyId]: updatedData
    }));
  }

  function handleGroupSlip() {
    if (!activeLobby) return;
    const lobbyId = activeLobby.id;

    setLobbyProgress(prev => ({
      ...prev,
      [lobbyId]: { days: 0, active: false, finished: false }
    }));

    alert("You reported a slip-up. You are disqualified from the prize pool in THIS lobby. (Your solo streak and other lobbies are untouched!)");
  }

  function handleLocalProgressUpdate() {
    const newDay = days + 1;
    setDays(newDay);
    setSaved(newDay * 3.5);
    if (milestones.includes(newDay)) {
      setBadges((prev) => (prev.includes(newDay) ? prev : [...prev, newDay]));
      setNewBadge(newDay);
    }
  }

  function handleLocalSlip() {
    setArchivedBadges((prev) => {
      const updated = [...prev];
      badges.forEach((day) => {
        const existingIndex = updated.findIndex((b) => b.day === day);
        if (existingIndex !== -1) {
          updated[existingIndex] = { ...updated[existingIndex], slipped: updated[existingIndex].slipped + 1 };
        } else {
          updated.push({ day, slipped: 1 });
        }
      });
      return updated;
    });
    setDays(0);
    setSaved(0);
    setBadges([]);
    setNewBadge(null);
  }

  async function markSmokeFree() {
    if (!window.ethereum) { alert("Install MetaMask"); return; }
    try {
      setLoading(true);
      const newDay = days + 1;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== 11155111) {
        alert("Wrong network! Please switch network in MetaMask.");
        setLoading(false);
        return;
      }
      if (!milestones.includes(newDay)) {
        handleLocalProgressUpdate();
        setLoading(false);
        return;
      }
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.markSmokeFree();
      await tx.wait();

      setDays(newDay);
      setSaved(newDay * 3.5);
      setBadges((prev) => (prev.includes(newDay) ? prev : [...prev, newDay]));
      setNewBadge(newDay);
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert("Transaction failed");
      setLoading(false);
    }
  }

  async function slippedToday() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.resetStreak();
      await tx.wait();
    } catch (err) { console.error(err); }
    handleLocalSlip();
  }

  async function mintGroupNFT() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const groupContract = getGroupContract(signer);

    const tx = await groupContract.mintGroupNFT(activeLobby.id);
    await tx.wait();

    alert("🏆 Group NFT minted!");
  } catch (err) {
    console.error(err);
    alert("Mint failed (not all conditions met or challenge not finished)");
  }
}

  async function createChallenge() {
    console.log("========== CREATE CHALLENGE ==========");
    console.log("NAME:", challengeName);
    console.log("PASSWORD:", challengePassword);
    console.log("DURATION:", challengeDuration);
    console.log("FEE:", challengeFee);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getChallengeContract(signer);

      if (!challengeName || !challengeDuration || !challengeFee || !challengePassword) { 
        alert("Fill all fields including password"); 
        return; 
      }

      if (!validatePassword(challengePassword)) {
        alert("Password must be exactly 5 characters long and contain exactly 3 numbers and 2 characters/symbols!");
        return;
      }

      const duration = Number(challengeDuration);
      if (duration < 1 || duration > 60) { alert("Duration 1-60 days"); return; }

  const parsedFee = ethers.parseEther(challengeFee);

    console.log("PARSED FEE:", parsedFee.toString());

    const tx = await contract.createChallenge(
     challengeName,
     challengePassword,
      duration,
      parsedFee
    );

    console.log("TX HASH:", tx.hash);     
    const receipt = await tx.wait();
    console.log("TX CONFIRMED");  
    console.log(receipt);
    
    let challengeId = null;
      
      if (receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsedLog = contract.interface.parseLog({ topics: [...log.topics], data: log.data });
            if (parsedLog && parsedLog.name === "ChallengeCreated") {
              challengeId = Number(parsedLog.args.challengeId);
              break;
            }
          } catch (e) {}
        }
      }

      await loadChallenges();
      setGroupScreen("list");
      setChallengeName(""); setChallengeDuration(""); setChallengeFee(""); setChallengePassword("");
      alert("Challenge created successfully! Enter via lobby list.");
    } catch (err) { 
  console.error("CREATE ERROR");
  console.error(err);
      alert(
    err.reason ||
    err.shortMessage ||
    err.message ||
    "Unknown error");
    }
  }

  async function joinChallenge(challenge) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getChallengeContract(signer);
      console.log("CONTRACT:", GROUP_CONTRACT_ADDRESS);

try {
  const count = await contract.challengeCount();
  console.log("CHALLENGE COUNT:", count.toString());
} catch(e) {
  console.error("challengeCount ERROR:", e);
}
      const tx = await contract.joinChallenge(challenge.id, { value: challenge.entryFee });
      await tx.wait();

      const c = await contract.getChallenge(challenge.id);
      setActiveLobby({
        id: Number(c[0]), name: c[1], password: c[2], duration: Number(c[3]), entryFee: c[4], creator: c[5], prizePool: c[6], startTime: Number(c[7]), active: c[8],
      });
      setScreen("activeChallenge");
    } catch (err) { 
      console.error(err); 
      setActiveLobby(challenge);
      setScreen("activeChallenge");
    }
  }

  function formatEth(value) {
    try {
      if (!value) return "0.0000 ETH";
      return Number(ethers.formatEther(value.toString())).toFixed(4) + " ETH";
    } catch { return "0.0000 ETH"; }
  }

  async function searchChallenge() {
    if (!searchId.trim()) { alert("Unesi ID"); return; }

    // prvo proba naci u postojećoj listi
    let found = challenges.find((c) => String(c.id) === String(searchId));
    
    // ako nije u listi, dohvatiti direktno s blockchaina
    if (!found) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = getChallengeContract(provider);
        const count = await contract.challengeCount();
console.log("TOTAL CHALLENGES:", count.toString());
        const c = await contract.getChallenge(Number(searchId));
        
        // provjera postoji li lobby (ako je duration 0, ne postoji)
        if (Number(c[3]) > 0) {
          found = { 
            id: Number(c[0]), name: c[1], password: c[2], duration: Number(c[3]), 
            entryFee: c[4], creator: c[5], prizePool: c[6], startTime: Number(c[7]), active: c[8] 
          };
        }
      } catch (err) {
        alert("Lobby ne postoji na blockchainu!");
        return;
      }
    }

    if (!found) { alert("Lobby nije pronađen"); return; }
    
    setSelectedChallenge(found); 
    setShowPasswordModal(true);
  }

  async function loadChallenges() {
  console.log("===== LOAD CHALLENGES =====");
  console.log("ADDRESS:", GROUP_CONTRACT_ADDRESS);

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = getChallengeContract(provider);

    const list = [];

    // BITNO: uzimamo stvarni broj challenga iz contracta
    let count = 0;

    try {
      count = await contract.challengeCount();
      console.log("TOTAL CHALLENGES:", count.toString());
    } catch (e) {
      console.error("challengeCount error:", e);
    }

    if (Number(count) === 0) {
      console.log("No challenges found on chain");
      setChallenges([]);
      setGroupScreen("list");
      return;
    }

    for (let i = 1; i <= Number(count); i++) {
      console.log("TRYING CHALLENGE", i);

      try {
        const c = await contract.getChallenge(i);
        console.log("FOUND:", c);

        // safety check (valid contract entry)
        if (
          !c ||
          c[5] === "0x0000000000000000000000000000000000000000" ||
          Number(c[3]) === 0
        ) {
          continue;
        }

        list.push({
          id: Number(c[0]),
          name: c[1],
          password: c[2],
          duration: Number(c[3]),
          entryFee: c[4],
          creator: c[5],
          prizePool: c[6],
          startTime: Number(c[7]),
          active: c[8],
        });
      } catch (err) {
        console.log("No challenge at index", i);
        break;
      }
    }

    console.log("FINAL LIST:", list);

    setChallenges(list);
    setGroupScreen("list");
  } catch (err) {
    console.error("LOAD CHALLENGES ERROR:", err);
  }
}

  return (
    <div className="app">
      <div className="card">
        {screen === "welcome" && (
          <>
            <h1>NoSmokeZone</h1>
            <p className="subtitle">Start your smoke-free journey</p>
            <button className="primary" onClick={connectWallet}>Connect Wallet</button>
          </>
        )}

        {screen === "nickname" && (
          <>
            <h2>Welcome</h2>
            <p>Choose your nickname</p>
            <input className="input" placeholder="Type right here..." onChange={(e) => setTempName(e.target.value)} />
            <button className="primary small-btn" onClick={saveName}>Continue</button>
          </>
        )}

        {screen === "modeSelect" && (
          <div className="mode-select">
            <h2>Choose mode</h2>
            <button className="primary" onClick={() => setScreen("dashboard")}>Play Solo</button>
            <button className="primary" onClick={() => setScreen("group")}>Group Play</button>
          </div>
        )}

       {screen === "dashboard" && (
          <>
            <h2>Hello {nickname}</h2>

            <div className="streak-box">
              <div>
                <p>Smoke-free for</p>
                <h1>{days} days</h1>
              </div>

              <div className="circle">
                <CircularProgressbar value={days} maxValue={60} text={`${days}`} />
              </div>
            </div>

            <div className="savings">
              <p>Saved</p>
              <h1>{saved}€</h1>
            </div>

            <div className="buttons">
              <button className="good" onClick={markSmokeFree} disabled={loading}>
                {loading ? "Minting..." : "Smoke-Free Today"}
              </button>

              <button className="bad" onClick={slippedToday} disabled={loading}>
                I Slipped Today
              </button>
            </div>

            <div className="badges">
              <h3>Badges</h3>
              {badges.length === 0 && <p>No badges yet!</p>}
              {badges.map((m) => (
                <div key={m} className="badge earned-badge">
                  <span className="icon">🏆</span>
                  <span>Day {m}</span>
                </div>
              ))}
            </div>

            {archivedBadges.length > 0 && (
              <div className="badges archived">
                <h3>Past Achievements</h3>
                {archivedBadges.map((b, i) => {
                  let slipDisplay = "";
                  if (b.slipped === 1) slipDisplay = slipText[0];
                  else if (b.slipped === 2) slipDisplay = slipText[1];
                  else if (b.slipped === 3) slipDisplay = slipText[2];
                  else if (b.slipped === 4) slipDisplay = slipText[3];
                  else slipDisplay = slipText[4];

                  return (
                    <div key={i} className="badge locked-badge">
                      <span className="icon">🔒</span>
                      <span>
                        Day {b.day} ({slipDisplay})
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {newBadge && (
              <div className={`popup ${fadeOut ? "fade-out" : ""}`}>
                <div className="popup-content">
                  <h2>🎉 New Badge!</h2>
                  <p>You reached Day {newBadge}!</p>
                  <button onClick={() => setNewBadge(null)}>Awesome!</button>
                </div>
              </div>
            )}
            <button className="text-button" onClick={() => { setGroupScreen("list"); setScreen("modeSelect"); }}>← Back to mode select</button>

          </>
        )}

        {/* ================= GROUP ACTIVE LOBBY ================= */}
        {screen === "activeChallenge" && (
          <div className="active-dashboard">
            <h2>Lobby: {activeLobby?.name}</h2>
            <p className="subtitle" style={{ fontSize: "13px" }}>
              Target: <strong>{activeLobby?.duration} days</strong>
            </p>

            <div className="invite-box">
              <h4>👥 Invite your friends:</h4>
              <div className="invite-item">Lobby ID: <span className="invite-highlight">{activeLobby?.id}</span></div>
              <div className="invite-item">Password: <span className="invite-highlight" style={{ color: "#2e7d32" }}>{activeLobby?.password}</span></div>
            </div>

            {currentLobbyData.finished ? (
              <div style={{ background: "#d4edda", border: "1px solid #c3e6cb", padding: "15px", borderRadius: "14px", textAlign: "center", margin: "15px 0" }}>
                <h3 style={{ color: "#155724", margin: "0 0 5px 0" }}>🏆 Challenge Complete!</h3>
                <p style={{ color: "#155724", fontSize: "13px", margin: "0 0 10px 0" }}>
                  You survived all {activeLobby?.duration} days! You get your share of the <strong>{formatEth(activeLobby?.prizePool)}</strong> pool!
                </p>
                
                {didWholeGroupSucceed ? (
                  <div style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "8px", border: "1px dashed #00c853" }}>
                    <p style={{ color: "#2e7d32", fontWeight: "bold", margin: "0 0 5px 0", fontSize: "12px" }}>Whole team menaged to not slip up! Team NFT unlocked 🎉</p>
                    <button className="good" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={mintGroupNFT}>Mint Shared Group NFT</button>
                  </div>
                ) : (
                  <p style={{ color: "#d32f2f", fontSize: "11px", margin: 0 }}>⚠️ Nažalost, netko iz grupe je imao slip-up, pa zajednički NFT nije dostupan.</p>
                )}
              </div>
            ) : !currentLobbyData.active ? (
              <div style={{ background: "#f8d7da", border: "1px solid #f5c6cb", padding: "15px", borderRadius: "14px", textAlign: "center", margin: "15px 0" }}>
                <h3 style={{ color: "#721c24", margin: "0 0 5px 0" }}>❌ Disqualified</h3>
                <p style={{ color: "#721c24", fontSize: "13px", margin: 0 }}>
                  You reported a slip-up in this challenge.
                </p>
              </div>
            ) : null}

            <div className="streak-box" style={{ opacity: currentLobbyData.active ? 1 : 0.5 }}>
              <div>
                <p>Your Group Streak</p>
                <h1>{currentLobbyData.days} / {activeLobby?.duration} days</h1>
              </div>
              <div className="circle">
                <CircularProgressbar value={currentLobbyData.days} maxValue={activeLobby?.duration || 10} text={`${currentLobbyData.days}`} />
              </div>
            </div>

            <div style={{ marginTop: "15px", fontSize: "15px", fontWeight: "600" }}>
              💰 Prize Pool: <span style={{ color: "#2e7d32" }}>{formatEth(activeLobby?.prizePool)}</span>
            </div>

            <div className="lobby-members-list">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h3>Lobby Status</h3>
                <span style={{ fontSize: "12px", color: "#666" }}> 👥 {members.length} / {activeLobby?.maxPlayers || 10} članova</span>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {members.map((member, i) => (
              <div
              key={i}
              className="member-row"
              style={{
              borderLeft:
                  member.status === "active"
                  ? "4px solid #a2d797"
                  : "4px solid #c96a6a",
             opacity: member.status === "active" ? 1 : 0.6
               }}
               >
               <span>
               👤 {member.name} <strong>({member.days}d)</strong>
               </span>

                 {member.status === "active" ? (
              <span className="member-status-active">🟢 Active</span>
               ) : (
                 <span className="member-status-failed">🔴 Failed</span>
                 )}
              </div>
                 ))}
                </div>
                </div>

            <div className="buttons" style={{ flexDirection: "column", gap: "10px" }}>
              <button 
                className="good" 
                style={{ width: "100%", padding: "14px", opacity: (currentLobbyData.active && !currentLobbyData.finished) ? 1 : 0.4 }} 
                onClick={handleGroupProgressUpdate}
                disabled={!currentLobbyData.active || currentLobbyData.finished}
              >
                {currentLobbyData.finished ? "Challenge Completed! 🎉" : "Mark Smoke Free Today"}
              </button>

              <button 
                className="bad" 
                style={{ width: "100%", padding: "14px", opacity: (currentLobbyData.active && !currentLobbyData.finished) ? 1 : 0.4 }} 
                onClick={handleGroupSlip}
                disabled={!currentLobbyData.active || currentLobbyData.finished}
              >
                Report Slip-up
              </button>
            </div>

            <button className="text-button" onClick={() => { setGroupScreen("list"); setScreen("group"); }}>← Back to Active Lobbies</button>
          </div>
        )}

       {screen === "group" && (
          <div className="group-container">
            <h2>Group Mode</h2>
            {groupScreen === "menu" && (
              <div className="group-menu">
                <button className="primary full" onClick={() => setGroupScreen("create")}>Create New Challenge</button>
                <button className="primary full" onClick={() => setGroupScreen("search")}>Search & Join Lobby</button>
                <button className="primary full" onClick={loadChallenges}>View All Active Lobbies</button>
                <button className="text-button" onClick={() => setScreen("modeSelect")}>← Back</button>
              </div>
            )}

            {groupScreen === "search" && (
              <div className="group-search">
                <h3>Search Lobby</h3>
                <input className="input" placeholder="Enter Lobby ID..." value={searchId} onChange={(e) => setSearchId(e.target.value)} />
                <button className="primary full" onClick={searchChallenge}>Search</button>
                <button className="text-button" onClick={() => setGroupScreen("menu")}>← Back</button>
              </div>
            )}

            {groupScreen === "create" && (
              <div className="create-box">
                <h3>Create Challenge</h3>
                <label>Name</label>
                <input placeholder="Challenge name" value={challengeName} onChange={(e) => setChallengeName(e.target.value)} />
                
                <label>Duration</label>
                <input type="number" min="1" max="60" placeholder="1 - 60 days" value={challengeDuration} onChange={(e) => setChallengeDuration(e.target.value)} />

                <label>Entry Fee (ETH)</label>
                <input type="number" min="0" step="0.001" placeholder="0.01" value={challengeFee} onChange={(e) => setChallengeFee(e.target.value)} />

                <label>Lobby Password (5 chars: 3 numbers, 2 symbols)</label>
                <input maxLength={5} placeholder="e.g. 123AB" value={challengePassword} onChange={(e) => setChallengePassword(e.target.value)} />

                <button className="primary full" style={{ marginTop: "20px" }} onClick={createChallenge}>Create</button>
                <button className="text-button" onClick={() => setGroupScreen("menu")}>← Back</button>
              </div>
            )}

            {groupScreen === "list" && (
              <div className="challenge-list">
                {challenges.length === 0 && <p>No active lobbies</p>}
                {challenges.map((c) => (
                  <div key={c.id} className="challenge-card">
                    <div className="card-header"><h3>{c.name}</h3></div>
                    <div className="card-body">
                      <p>Duration: {c.duration} days</p>
                      <p>Entry Fee: {formatEth(c.entryFee)}</p>
                      <p>Pool: {formatEth(c.prizePool)}</p>
                    </div>
                    <button
                      className="join-btn" style={{ color: "#fff", fontWeight: "600" }}
                      onClick={() => {
                        if (c.password && c.password.trim() !== "") {
                          setSelectedChallenge(c); 
                          setShowPasswordModal(true);
                        } else { 
                          joinChallenge(c); 
                        }
                      }}
                    >
                      Join Challenge
                    </button>
                  </div>
                ))}
              <button className="text-button" onClick={() => setGroupScreen("menu")}>← Back</button>
              </div>
            )}
            
            {showPasswordModal && selectedChallenge && (
              <div className="modal">
                <div className="modal-box">
                  <h3 style={{ color: "#fff" }}>🔒 Private Lobby</h3>
                  <input className="input" type="password" placeholder="Password..." value={joinPassword} onChange={(e) => setJoinPassword(e.target.value)} />
                  <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                    <button className="primary" onClick={() => { if (joinPassword !== selectedChallenge.password) { alert("Wrong password"); return; } setShowPasswordModal(false); setJoinPassword(""); joinChallenge(selectedChallenge); }}>Confirm</button>
                    <button style={{ background: "#444", color: "#fff" }} onClick={() => { setShowPasswordModal(false); setJoinPassword(""); }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;