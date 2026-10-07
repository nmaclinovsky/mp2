import "./App.css";
import axios from "axios";
import { BrowserRouter,Routes,Route,Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

type Coin = {
  id: string;
  name: string;
  current_price:number;
  market_cap: number;
  image: string;
  price_change_percentage_24h: number;
};

function ListView({coins}: {coins: Coin[]}){
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("price");
  const [sortOrder,setSortOrder] =useState("descending");
  

  const filteredCoins = coins.filter((coin)=>
  coin.name.toLowerCase().includes(search.toLowerCase()));

  const sortedCoins =[...filteredCoins].sort((a, b) =>{
  let difference = 0;
  if (sortBy === "price"){
    difference = a.current_price - b.current_price;} 
  else{
    difference = a.market_cap -b.market_cap;
  }

  if(sortOrder === "descending") {
    return -difference;
  }
  return difference;
});


  return(
    <div>
      <h2>List View</h2>
      <input
        type="text"
        placeholder="Search cryptocurrencies..."
        value={search}
        onChange={(e) =>setSearch(e.target.value)}
      />

      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="price">Price</option>
        <option value="market_cap">Market Cap</option>
      </select>

      <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
        <option value="ascending">Ascending</option>
        <option value="descending">Descending</option>
      </select>

      <ul className="coin-list">{sortedCoins.map((coin) => (
        <li key={coin.id}>
          <Link to={`/coin/${coin.id}`}>{coin.name}</Link>-${coin.current_price}
        </li>))} </ul>
    </div>);
}

function GalleryView({coins}: {coins: Coin[]}){
  const [filter, setFilter] = useState("all");
  const filteredCoins= coins.filter((coin)=>{
    if(filter === "up"){
      return coin.price_change_percentage_24h > 0;
    }
    if(filter === "down"){
    return coin.price_change_percentage_24h < 0;
    }
    return true;
  });

  return (
    <div>
      <h2>Gallery View</h2>
      <select value={filter} onChange={(e) =>setFilter(e.target.value)}>
        <option value="all">All Coins</option>
        <option value="up">Gainers</option>
        <option value="down">Losers</option>
      </select>

      <div className="gallery">
        {filteredCoins.map((coin) => (
          <div key={coin.id}>
            <Link to={`/coin/${coin.id}`}>
            <img src={coin.image} alt={coin.name}/>
            <h3>{coin.name}</h3>
            </Link>
          <p>${coin.current_price}</p>
          </div>))}
      </div>
    </div>);
}

function DetailView({coins}: {coins: Coin[]}){
  const {id} = useParams(); 
  const coin = coins.find((c) => c.id === id);
  const index = coins.findIndex((c) => c.id === id);
  console.log("Coins:", coins.length);
  console.log("Index:", index);
  console.log("ID:", id);

  return (
    <div className="details">
      <h2>Coin Details</h2>
      

      {coin &&(<div>
          <h3>{coin.name}</h3>
          <img src={coin.image} alt={coin.name}/>
          <p>Price: ${coin.current_price}</p>
          <p>Market Cap: ${coin.market_cap}</p>
      </div>)}

      <div>
        {index > 0 && (
        <Link to={`/coin/${coins[index - 1].id}`}>
        Previous
        </Link>)}

        {index >= 0 && index < coins.length - 1 && (
          <Link to={`/coin/${coins[index + 1].id}`}>
            Next
          </Link>)}
      </div>
    </div>);
}

function App(){
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(()=>{
  axios.get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=50&page=1")
  .then((response) =>{
    setCoins(response.data);
  })
  .catch((error) =>{
    console.log("Error loading coins:", error);
  });
  },[]);


  return(<BrowserRouter basename={import.meta.env.BASE_URL}>
  <div>
      <h1>Crypto Dashboard</h1>
    <p>Welcome to my cryptocurrency tracker!</p>
    <nav> <Link to="/gallery">Gallery View</Link>
      <Link to="/">List View</Link>
    </nav>
    <p>Loaded coins: {coins.length}</p>
    <Routes>
      <Route path="/gallery" element={<GalleryView coins={coins}/>}/>
      <Route path="/" element={<ListView coins={coins} />} />
      <Route path="/coin/:id" element={<DetailView coins={coins} />}/>
    </Routes>
  </div></BrowserRouter>);
}

export default App;