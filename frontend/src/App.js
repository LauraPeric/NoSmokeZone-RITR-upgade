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

 function getChallengeContract(signerOrProvider) {
  return new ethers.Contract(
    GROUP_CONTRACT_ADDRESS,
    GROUP_CONTRACT_ABI,
    signerOrProvider
  );
}
  
  //progres bar
  const [days, setDays] = useState(0);
  const [saved, setSaved] = useState(0);

  const [badges, setBadges] = useState([]); //aktivni 
  const [archivedBadges, setArchivedBadges] = useState([]);
  const [newBadge, setNewBadge] = useState(null);
  
  // dok traje blockchain transakcija
  const [loading, setLoading] = useState(false); // transakcjia traje
  const [isLoaded, setIsLoaded] = useState(false); // transkacija gotova

  //micanje obavijesti 
  const [fadeOut, setFadeOut] = useState(false);

  const milestones = [1, 7, 15, 30, 60];

  const slipText = [
    "Slipped once",
    "Slipped twice",
    "Slipped several times",
    "Slipped many times",
    "Slipped often",
  ];



  useEffect(() => { //load podataka
    const savedDays = sessionStorage.getItem("days"); //dohvati podatke
    const savedMoney = sessionStorage.getItem("saved"); 
    const savedName = sessionStorage.getItem("nickname");
    const savedArchived = sessionStorage.getItem("archivedBadges");

    if (savedDays !== null) setDays(Number(savedDays)); //ucitaj 
    if (savedMoney !== null) setSaved(Number(savedMoney));
    if (savedArchived) setArchivedBadges(JSON.parse(savedArchived));

    if (savedName) { // ako postoji user salji ga na dashboard
      setNickname(savedName);
      setScreen("modeSelect");
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => { //save podataka
    if (!isLoaded) return;

    sessionStorage.setItem("days", days);
    sessionStorage.setItem("saved", saved);
    sessionStorage.setItem("nickname", nickname);
    sessionStorage.setItem("archivedBadges", JSON.stringify(archivedBadges));
  }, [days, saved, nickname, archivedBadges, isLoaded]);

useEffect(() => { // BADGE POPUP
  if (newBadge) {
    setFadeOut(false);

    const fadeTimer = setTimeout(() => {
      setFadeOut(true); // pokrene fade
    }, 8000); // nakon 8s krene nestajanje

    const removeTimer = setTimeout(() => {
      setNewBadge(null); // makne ga skroz
    }, 10000); // nestane nakon 10s

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }
}, [newBadge]);

  async function connectWallet() {
    const provider = await detectEthereumProvider();
    if (!provider) {
      alert("Install MetaMask");
      return;
    }

    await window.ethereum.request({ method: "eth_requestAccounts" }); // MetaMask popup
    const userAddress = window.ethereum.selectedAddress;

    console.log(" CONNECTED WALLET:", userAddress);

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
    setNickname(tempName); // spremi 
    setScreen("modeSelect");
  }

  async function markSmokeFree() {
   if (!window.ethereum) {
    alert("Install MetaMask");
    return;
    }

    try {
    setLoading(true);

    console.log("CLICKED Smoke Free Today");

    const newDay = days + 1;

    // NETWORK CHECK
    const provider = new ethers.BrowserProvider(window.ethereum); //povezivanje blck i frnt 
    const network = await provider.getNetwork();

    const EXPECTED_CHAIN_ID = 11155111;

    if (Number(network.chainId) !== EXPECTED_CHAIN_ID) {
      alert("Wrong network! Please switch network in MetaMask.");
      setLoading(false);
      return;
    }

    // AKO NIJE milestone odmah update
    if (!milestones.includes(newDay)) {
      console.log("⏭ NO MILESTONE LOCAL UPDATE");

      setDays(newDay);
      setSaved(newDay * 3.5);

      setLoading(false);
      return;
    }
    console.log("NEW DAY:", newDay);
    console.log("MILESTONE HIT SENDING TX");

    const signer = await provider.getSigner(); //user potipsuje 
    const user = await signer.getAddress();

    console.log("USER ADDRESS:", user);

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer); // instanca smart contracta

    const tx = await contract.markSmokeFree(); //salje tranksakcju 

    console.log("TX HASH:", tx.hash);

    await tx.wait(); // cekanje potvrde transkcije

    console.log("TX CONFIRMED");

    // azuriranje stanja i novi badge se prikzuje
    setDays(newDay);
    setSaved(newDay * 3.5);

    setBadges((prev) => {
      if (prev.includes(newDay)) return prev;
      return [...prev, newDay];
    });

    setNewBadge(newDay);

    setLoading(false);

   } catch (error) {
    console.error("ERROR:", error);
    alert("Transaction failed");
    setLoading(false);
   }
  }


  async function slippedToday() {

   try {
    const provider = new ethers.BrowserProvider(window.ethereum); //aplikacija povezana s metamask
    const signer = await provider.getSigner(); // dohvcanje aktv account postaje singer

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    console.log("🔄 Resetting streak on blockchain...");

    const tx = await contract.resetStreak();
    console.log("TX HASH:", tx.hash);

    await tx.wait(); //potvrda transakcije slippa

    console.log("STREAK RESET ON BLOCKCHAIN");
   } catch (err) {
    console.error("RESET FAILED:", err);
   }


   setArchivedBadges((prev) => {
    const updated = [...prev]; 

    badges.forEach((day) => { //svi trenutni badgevi prolazak
      const existingIndex = updated.findIndex((b) => b.day === day); //postoji i taj bedge?

      if (existingIndex !== -1) { //postoji
        updated[existingIndex] = {
          ...updated[existingIndex],
          slipped: updated[existingIndex].slipped + 1, //povecava broj relapsa 
        };
      } else {
        updated.push({ day, slipped: 1 }); //dodavanje novog zapisa
      }
    }); 

    return updated;
   });

    setDays(0);
    setSaved(0);
    setBadges([]);
    setNewBadge(null);
  }

  async function createChallenge() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = getChallengeContract(signer);

    const tx = await contract.createChallenge(
      challengeName,
      Number(challengeDuration),
      ethers.parseEther(challengeFee)
    );

    await tx.wait();

    alert("Challenge created!");

  } catch (err) {
    console.error(err);
  }
 }

 async function joinChallenge(id, entryFee) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = getChallengeContract(signer);

    const tx = await contract.joinChallenge(id, {
      value: ethers.parseEther("0")
    });

    await tx.wait();

    alert("Joined challenge!");

  } catch (err) {
    console.error(err);
  }
 }

 async function loadChallenges() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = getChallengeContract(provider);

    const list = [];

    for (let i = 1; i <= 20; i++) {
      try {
        const c = await contract.getChallenge(i);

        list.push({
            id: c[0],
            name: c[1],
            duration: Number(c[2]),
            creator: c[3],
          });
      } catch {
        break;
      }
    }

    setChallenges(list);

  } catch (err) {
    console.error(err);
  }
}

  return (
    <div className="app">
      <div className="card">
        {screen === "welcome" && (
          <>
            <h1>NoSmokeZone</h1>
            <p className="subtitle">Start your smoke-free journey</p>

            <button className="primary" onClick={connectWallet}>
              Connect Wallet
            </button>

            <div className="features">
              <p>Track your progress</p>
              <p>Save money</p>
              <p>Build healthy habits</p>
            </div>
          </>
        )}

        {screen === "nickname" && (
          <>
            <h2>Welcome</h2>
            <p>Choose your nickname</p>

            <input
              className="input"
              placeholder="Type right here..."
              onChange={(e) => setTempName(e.target.value)}
            />

            <button className="primary small-btn" onClick={saveName}>
              Continue
            </button>
          </>
        )}

         {screen === "modeSelect" && (  //dodano
          <div>
            <h2>Choose mode</h2>

            <button
              className="primary"
              onClick={() => setScreen("dashboard")}
            >
              Play Solo
            </button>

            <button
              className="primary"
              onClick={() => setScreen("group")}
            >
              Group Play
            </button>
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
            <button
             className="secondary"
            onClick={() => setScreen("modeSelect")}    
            >
              Back
            </button>
          </>
        )}

{screen === "group" && (
  <div>
    <h2>Group Mode</h2>

    <p>Create or join challenges</p>

    <button className="primary" onClick={loadChallenges}>
      Load Challenges
    </button>

    <div>
      {challenges.length === 0 && <p>No challenges yet</p>}

      {challenges.map((c) => (
        <div key={c.id} className="badge">
          <p>{c.name}</p>
          <p>{c.duration} days</p>

          <button
            onClick={() => joinChallenge(c.id, c.entryFee)}
          >
            Join
          </button>
        </div>
      ))}
    </div>

    <hr />

    <h3>Create Challenge</h3>

    <input
      placeholder="Name"
      onChange={(e) => setChallengeName(e.target.value)}
    />
    <input
      placeholder="Duration"
      onChange={(e) => setChallengeDuration(e.target.value)}
    />
    <input
      placeholder="Fee (ETH)"
      onChange={(e) => setChallengeFee(e.target.value)}
    />

    <button onClick={createChallenge}>
      Create
    </button>
    <br />
    <button
      className="secondary"
      onClick={() => setScreen("modeSelect")}
    >
      Back
    </button>
  </div>
)}

      </div>
    </div>
  );
}

export default App;