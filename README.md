# NoSmokeZone – Blockchain Aplikacija

**Fakultet:** Fakultet informatike u Puli  
**Kolegij:** Razvoj IT rješenja  
**Nositelj kolegija:** doc. dr. sc. Nikola Tanković  
**Asistent:** Luka Sever, mag. inf.  
**Student:** Laura Perić  

---

### 🔄 Napomena o razvoju i nadogradnji projekta
Ovaj projekt predstavlja naprednu nadogradnju inicijalnog rješenja razvijenog u sklopu prethodnih faza rada. Fokus ove iteracije bio je na uvođenju kompleksnije pametne logike (Smart Contract-driven escrow) i elemenata decentraliziranih financija (DeFi) kroz grupnu dinamiku.

**Što je preuzeto iz prethodne verzije:**
* Temeljna ideja praćenja osobnog streaka pušenja.
* Inicijalna struktura React frontend-a i bazični pametni ugovor za solo milestone NFT-ove.

**Ključne nadogradnje u ovoj verziji (Fokus ovog rada):**
1. **Group Mode (DeFi/Staking element):** Potpuno novi pametni ugovor (`GroupChallenges`) koji samostalno upravlja grupnom dinamikom, zaključavanjem ETH uloga (escrow pool) i decentraliziranom distribucijom financijskih nagrada.
2. **Dinamička personalizacija:** Proširenje NFT logike koja sada omogućuje korisnicima slanje prilagođenih parametara (metadata) prije samog mintanja pojedinačnih bedževa.
3. **Zajednički grupni NFT-ovi:** Implementacija logike koja prati ponašanje cijele grupe i nagrađuje timski rad specifičnim, zajedničkim NFT-om ako svi članovi uspješno završe izazov.
4. **Refaktoriranje koda:** Prilagodba frontend sučelja za rad s više pametnih ugovora istovremeno i optimizacija prikaza aktivnih sesija.

---

## 🧠 Opis projekta

**NoSmokeZone** je decentralizirana blockchain aplikacija (dApp) čiji je cilj potaknuti korisnike na prestanak pušenja kroz gamifikaciju u obliku NFT nagrada i ekonomskih poticaja. Sustav omogućuje korisnicima praćenje osobnog "streaka" (uzastopnih dana bez pušenja), ali i sudjelovanje u **grupnim izazovima s ulozima** (DeFi element), čime se povećava odgovornost i motivacija za ustrajanje.

Aplikacija se sastoji od:
* **Frontend dijela** razvijenog u Reactu.
* **Smart contracta** implementiranih u Solidity jeziku koji su deployani na Sepolia testnet.

Interakcija s blockchainom ostvaruje se putem MetaMask walleta. Sustav ne koristi klasični backend server, već se u potpunosti oslanja na decentraliziranu logiku izvršavanja i pohrane putem pametnih ugovora.

---

## 🛠 Korištene tehnologije i servisi

* **Frontend:** React (JavaScript, HTML, CSS) – Upravlja stanjem aplikacije, UI komponentama te komunikacijom sa smart contractima putem Web3 biblioteka (`ethers.js`).
* **Blockchain:** Ethereum Sepolia Testnet – Testna mreža koja omogućuje besplatno izvršavanje transakcija i testiranje dApp-a bez stvarnog financijskog troška.
* **Smart Contracts:** Solidity – Implementira kompletnu logiku aplikacije kroz tri pametna ugovora:
  * `NoSmokeNFT` – Upravlja osobnom streak logikom i provjerom milestone-ova.
  * `SmokeFreeBadges` – Upravlja mintanjem i dinamičkim/personaliziranim metapodacima za NFT nagrade.
  * `GroupChallenges` *(Novo)* – Upravlja kreiranjem grupa, zaključavanjem ETH uloga (escrow fond) i distribucijom nagrada nakon završetka izazova.
* **Wallet integracija:** MetaMask – Autentifikacija korisnika i sigurno potpisivanje transakcija.
* **Pohrana metadata:** IPFS (InterPlanetary File System) – Decentralizirana i trajna pohrana slika i JSON metapodataka povezanih s NFT bedževima.

---

## 🎯 Glavne funkcionalnosti

### 1. Solo način rada (Personal Streak)
* ✅ Povezivanje MetaMask walleta.
* ✅ Manualno označavanje dana bez pušenja (“mark smoke free”).
* ✅ Reset osobnog streaka u slučaju pokleknuća (“slip-up”).
* ✅ Automatsko mintanje NFT bedževa pri milestone-ovima (1, 7, 15, 30, 60 dana).

### 2. Grupni izazovi (Group Mode) – *(Novo)*
* ✅ **Kreiranje i pridruživanje grupama:** Korisnici mogu kreirati manje izazove s definiranim trajanjem (u danima) i ulogom, ili se pridružiti postojećima.
* ✅ **Zajednički fond (Staking Pool):** Prilikom ulaska u grupu, svaki član uplaćuje obvezan iznos u kriptovaluti (ETH), čime se formira zajednički nagradni fond koji se zaključava unutar pametnog ugovora.
* ✅ **Praćenje i penalizacija:** Korisnici unutar grupe prate svoj napredak. Ako netko prijavi "slip-up" ili ne održi streak do kraja izazova, gubi pravo na svoj ulog.
* ✅ **Distribucija fonda:** Po završetku izazova, pametni ugovor automatiziranim algoritmom pravedno dijeli cijeli zajednički fond (uključujući uloge onih koji su odustali) samo na adrese članova koji su uspješno izdržali izazov do kraja.
* ✅ **Grupni NFT (Team Achievement):** U slučaju da *svi* članovi grupe uspješno završe izazov bez ijednog neuspjeha, pametni ugovor minta poseban, rijedak zajednički NFT za cijeli tim kao dokaz savršenog timskog postignuća.

---

## 🧩 Pregled komponenti sustava

| Komponenta | Opis funkcionalnosti |
| :--- | :--- |
| **React frontend** | Korisničko sučelje aplikacije (Solo Dashboard, Group Mode screen, NFT Minting panel). |
| **NoSmokeNFT contract** | Upravlja osobnom streak logikom, milestone provjerama i custom metapodacima. |
| **GroupChallenges contract** | Upravlja logikom grupa, primanjem uplata (fondova), provjerom statusa grupa i isplatama. |
| **SmokeFreeBadges contract** | Mintanje personaliziranih individualnih bedževa i specijalnih grupnih NFT-ova. |
| **MetaMask** | Upravlja privatnim ključevima, potpisivanjem transakcija i slanjem uloga u pametni ugovor. |
| **Sepolia testnet** | Blockchain mreža na kojoj se nalaze ugovori i izvršavaju transakcije. |
| **IPFS** | Decentralizirana pohrana slika i dinamički generiranih JSON datoteka za NFT-ove. |

---

## ⚙️ Pokretanje aplikacije

Aplikacija se lokalno pokreće na lokaciji: `http://localhost:3000`

### 📁 Pokretanje frontend aplikacije
```bash
cd frontend
npm install
npm start
