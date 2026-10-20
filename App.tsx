import { useMemo, useState } from 'react';
import {
  ArrowRight, Bike, Check, ChevronDown, Clock3, Heart, MapPin, Menu as MenuIcon,
  Minus, Plus, Search, ShoppingBag, Star, Utensils, X, UserRound, Store,
} from 'lucide-react';
import { hasFirebaseConfig } from './firebase';

type Category = 'All' | 'Fast Food' | 'Grill' | 'Pizza' | 'Traditional' | 'Drinks';
type FoodItem = { name: string; price: number; emoji: string };
type Restaurant = {
  id: number; name: string; description: string; category: Exclude<Category, 'All'>;
  emoji: string; theme: string; rating: string; time: string; featured?: string;
  items: FoodItem[];
};

const restaurants: Restaurant[] = [
  { id: 1, name: 'Kasi Grill House', description: 'Flame-grilled favourites & braai plates', category: 'Grill', emoji: '🍗', theme: 'peach', rating: '4.8', time: '25–40 min', featured: 'KASI FAVOURITE', items: [{ name: 'Quarter chicken', price: 55, emoji: '🍗' }, { name: 'Wings & chips', price: 65, emoji: '🍟' }, { name: 'Braai platter', price: 145, emoji: '🥩' }] },
  { id: 2, name: 'Township Burger Spot', description: 'Burgers stacked with big flavour', category: 'Fast Food', emoji: '🍔', theme: 'pink', rating: '4.7', time: '20–35 min', items: [{ name: 'Classic burger', price: 39, emoji: '🍔' }, { name: 'Cheese burger', price: 49, emoji: '🍔' }, { name: 'Loaded chips', price: 35, emoji: '🍟' }] },
  { id: 3, name: "Mama's Kasi Kitchen", description: 'Comforting plates made with love', category: 'Traditional', emoji: '🥘', theme: 'green', rating: '4.9', time: '30–45 min', featured: 'LOCAL GEM', items: [{ name: 'Pap & beef stew', price: 65, emoji: '🥘' }, { name: 'Chicken plate', price: 58, emoji: '🍗' }, { name: 'Mogodu', price: 75, emoji: '🍲' }] },
  { id: 4, name: 'Slice of Kasi Pizza', description: 'Freshly baked, cheesy and generous', category: 'Pizza', emoji: '🍕', theme: 'gold', rating: '4.6', time: '25–40 min', items: [{ name: 'Margherita pizza', price: 69, emoji: '🍕' }, { name: 'BBQ chicken pizza', price: 89, emoji: '🍕' }, { name: 'Meaty pizza', price: 99, emoji: '🍕' }] },
  { id: 5, name: 'Chill Zone Drinks', description: 'Cold drinks, shakes & refreshments', category: 'Drinks', emoji: '🥤', theme: 'blue', rating: '4.5', time: '15–25 min', items: [{ name: 'Soft drink', price: 15, emoji: '🥤' }, { name: 'Milkshake', price: 32, emoji: '🥤' }, { name: 'Fresh juice', price: 25, emoji: '🧃' }] },
  { id: 6, name: 'Crispy Corner', description: 'Crispy chicken, sides and sauces', category: 'Fast Food', emoji: '🍟', theme: 'lilac', rating: '4.7', time: '20–35 min', items: [{ name: 'Chicken strips', price: 45, emoji: '🍗' }, { name: 'Chips & sauce', price: 25, emoji: '🍟' }, { name: 'Snack box', price: 55, emoji: '🍱' }] },
];

const categories: { name: Category; emoji: string }[] = [
  { name: 'All', emoji: '🍽️' }, { name: 'Fast Food', emoji: '🍔' }, { name: 'Grill', emoji: '🍗' },
  { name: 'Pizza', emoji: '🍕' }, { name: 'Traditional', emoji: '🥘' }, { name: 'Drinks', emoji: '🥤' },
];

type CartLine = FoodItem & { key: string; restaurantId: number; restaurantName: string; quantity: number };

export default function App() {
  const [category, setCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [fulfilment, setFulfilment] = useState<'Delivery' | 'Collection'>('Delivery');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const filtered = useMemo(() => restaurants.filter((restaurant) => {
    const matchesCategory = category === 'All' || restaurant.category === category;
    const text = `${restaurant.name} ${restaurant.description} ${restaurant.category} ${restaurant.items.map((item) => item.name).join(' ')}`.toLowerCase();
    return matchesCategory && text.includes(query.toLowerCase().trim());
  }), [category, query]);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = fulfilment === 'Delivery' && cart.length ? 20 : 0;
  const total = subtotal + deliveryFee;

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }
  function addItem(restaurant: Restaurant, item: FoodItem) {
    const key = `${restaurant.id}-${item.name}`;
    setCart((current) => {
      const existing = current.find((line) => line.key === key);
      return existing
        ? current.map((line) => line.key === key ? { ...line, quantity: line.quantity + 1 } : line)
        : [...current, { ...item, key, restaurantId: restaurant.id, restaurantName: restaurant.name, quantity: 1 }];
    });
    notify(`${item.name} added to basket`);
  }
  function changeQuantity(key: string, delta: number) {
    setCart((current) => current.map((line) => line.key === key ? { ...line, quantity: line.quantity + delta } : line).filter((line) => line.quantity > 0));
  }
  function jumpToRestaurants() {
    document.getElementById('restaurants')?.scrollIntoView({ behavior: 'smooth' });
    setMobileNav(false);
  }
  function submitDemoOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cart.length) return;
    const order = {
      customerName, phone, address: fulfilment === 'Delivery' ? address : 'Collection',
      fulfilment, items: cart, subtotal, deliveryFee, total, createdAt: new Date().toISOString(),
    };
    const previous = JSON.parse(localStorage.getItem('fm24-demo-orders') || '[]') as unknown[];
    localStorage.setItem('fm24-demo-orders', JSON.stringify([...previous, order]));
    setCheckoutOpen(false);
    setCartOpen(false);
    setCart([]);
    notify('Demo order saved on this device. Live order processing is not connected yet.');
  }

  return (
    <div className="app-shell">
      <div className="announcement"><div className="container announcement-inner"><span><MapPin size={13} /> Serving your Kasi, one meal at a time</span><span>Fast delivery <i>·</i> Easy collection <i>·</i> Local favourites</span></div></div>
      <header className="site-header">
        <div className="container nav-row">
          <a className="brand" href="#top" aria-label="FM24 Kasi Food home"><span className="brand-mark"><Utensils size={23} /></span><span className="brand-text">FM24 <b>Kasi Food</b><small>GOOD FOOD. CLOSE TO HOME.</small></span></a>
          <nav className={mobileNav ? 'main-nav open' : 'main-nav'}>
            <a href="#restaurants" onClick={() => setMobileNav(false)}>Restaurants</a>
            <a href="#how" onClick={() => setMobileNav(false)}>How it works</a>
            <a href="#partners" onClick={() => setMobileNav(false)}>Partner with us</a>
          </nav>
          <div className="nav-actions">
            <button className="btn btn-primary nav-order" onClick={jumpToRestaurants}>Order food <ArrowRight size={16} /></button>
            <button className="icon-button mobile-menu" aria-label="Toggle menu" onClick={() => setMobileNav(!mobileNav)}>{mobileNav ? <X /> : <MenuIcon />}</button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="container hero-layout">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-dot" /> YOUR LOCAL FOOD MARKETPLACE</div>
              <h1>Your Kasi favourites,<br /><em>delivered.</em></h1>
              <p>Discover local restaurants, find the meals you love, and choose fast delivery or easy collection. Great food starts right here in your community.</p>
              <div className="hero-buttons"><button className="btn btn-primary btn-large" onClick={jumpToRestaurants}>Explore restaurants <ArrowRight size={17} /></button><a className="btn btn-outline btn-large" href="#partners">Become a partner</a></div>
              <div className="hero-proof"><div><strong>Local first</strong><span>Support Kasi businesses</span></div><div><strong>Easy ordering</strong><span>Simple from start to finish</span></div><div><strong>Your choice</strong><span>Delivery or collection</span></div></div>
            </div>
            <div className="hero-visual">
              <div className="food-halo"><div className="food-plate"><span>🍔</span><span className="plate-fries">🍟</span></div></div>
              <div className="floating-card card-top"><span className="floating-icon"><Bike size={21} /></span><span><b>Quick & convenient</b><small>Order in a few taps</small></span></div>
              <div className="floating-card card-bottom"><span className="floating-icon heart"><Heart size={21} fill="currentColor" /></span><span><b>Made for the Kasi</b><small>Local spots, local flavour</small></span></div>
              <div className="visual-spark spark-one">✳</div><div className="visual-spark spark-two">✦</div>
            </div>
          </div>
        </section>

        <section className="categories-section">
          <div className="container">
            <div className="section-heading"><div><span className="kicker">WHAT ARE YOU CRAVING?</span><h2>Find your flavour</h2><p>A little something for every kind of appetite.</p></div></div>
            <div className="category-grid">{categories.map((item) => <button key={item.name} className={`category-tile ${category === item.name ? 'selected' : ''}`} onClick={() => { setCategory(item.name); jumpToRestaurants(); }}><span>{item.emoji}</span><b>{item.name === 'All' ? 'All food' : item.name === 'Traditional' ? 'Kasi plates' : item.name === 'Grill' ? 'Grill & braai' : item.name}</b></button>)}</div>
          </div>
        </section>

        <section className="restaurants-section" id="restaurants">
          <div className="container">
            <div className="restaurant-heading"><div><span className="kicker">MADE IN YOUR COMMUNITY</span><h2>Explore local favourites</h2><p>Discover something delicious around you.</p></div><label className="search-box"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search food or restaurants…" /><kbd>⌘ K</kbd></label></div>
            <div className="filter-row">{categories.map((item) => <button key={item.name} className={`filter-chip ${category === item.name ? 'active' : ''}`} onClick={() => setCategory(item.name)}>{item.name === 'Traditional' ? 'Kasi plates' : item.name === 'Grill' ? 'Grill & braai' : item.name === 'All' ? 'All restaurants' : item.name}</button>)}</div>
            <div className="restaurant-grid">
              {filtered.map((restaurant) => <article className="restaurant-card" key={restaurant.id}>
                <button className={`restaurant-art ${restaurant.theme}`} onClick={() => setSelectedRestaurant(restaurant)} aria-label={`View ${restaurant.name} menu`}><span className="art-tag">{restaurant.featured || restaurant.category.toUpperCase()}</span><span className="food-emoji">{restaurant.emoji}</span><span className="art-open">View menu <ArrowRight size={14} /></span></button>
                <div className="restaurant-content"><div className="restaurant-title"><div><button className="text-link" onClick={() => setSelectedRestaurant(restaurant)}><h3>{restaurant.name}</h3></button><p>{restaurant.description}</p></div><span className="rating"><Star size={14} fill="currentColor" /> {restaurant.rating}</span></div><div className="restaurant-meta"><span><Clock3 size={14} /> {restaurant.time}</span><span>From <b>R{Math.min(...restaurant.items.map((item) => item.price))}</b></span><button className="quick-add" aria-label={`Add ${restaurant.items[0].name} to basket`} onClick={() => addItem(restaurant, restaurant.items[0])}><Plus size={19} /></button></div></div>
              </article>)}
              {filtered.length === 0 && <div className="no-results"><span>🔎</span><h3>No matches just yet</h3><p>Try another search or choose a different category.</p><button className="btn btn-outline" onClick={() => { setQuery(''); setCategory('All'); }}>Clear filters</button></div>}
            </div>
            <p className="sample-note">Preview listings and prices are examples for demonstration, not confirmed restaurant partners.</p>
          </div>
        </section>

        <section className="how-section" id="how"><div className="container">
          <div className="section-heading centered"><span className="kicker">GOOD FOOD, LESS FUSS</span><h2>Three steps to happy</h2><p>Ordering your next favourite meal should be this easy.</p></div>
          <div className="steps-grid"><div className="step"><span className="step-number">01</span><span className="step-emoji">🔎</span><h3>Find your favourite</h3><p>Browse local restaurants and explore menus full of Kasi flavour.</p></div><div className="step"><span className="step-number">02</span><span className="step-emoji">🛍️</span><h3>Build your basket</h3><p>Add your favourite meals and choose delivery or collection.</p></div><div className="step"><span className="step-number">03</span><span className="step-emoji">🛵</span><h3>Enjoy your food</h3><p>Get ready for your meal. Live order updates are coming next.</p></div></div>
        </div></section>

        <section className="partner-section" id="partners"><div className="container"><div className="partner-panel"><div className="partner-copy"><span className="kicker light">FOR LOCAL FOOD BUSINESSES</span><h2>Your food deserves<br />a bigger audience.</h2><p>Join FM24 Kasi Food and help more customers discover the flavours you bring to the community.</p><button className="btn btn-white" onClick={() => notify('Partner registration is the next feature we will connect.')}>Become a restaurant partner <ArrowRight size={16} /></button></div><div className="partner-art"><div className="partner-circle">🍲</div><span className="partner-sticker sticker-one">LOCAL LOVE ♥</span><span className="partner-sticker sticker-two">GROW TOGETHER ↗</span></div></div></div></section>
      </main>

      <footer className="site-footer"><div className="container footer-main"><a className="brand footer-brand" href="#top"><span className="brand-mark"><Utensils size={23} /></span><span className="brand-text">FM24 <b>Kasi Food</b><small>GOOD FOOD. CLOSE TO HOME.</small></span></a><p>Connecting local restaurants with customers<br />for fast delivery and collection.</p><div className="footer-links"><a href="#restaurants">Explore food</a><a href="#partners">Partner with us</a><a href="mailto:hello@fm24kasifood.example">Contact</a></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} FM24 Kasi Food</span><span>Made for the Kasi, with love. <Heart size={13} fill="currentColor" /></span></div></footer>

      <button className="basket-fab" onClick={() => setCartOpen(true)}><span className="basket-icon"><ShoppingBag size={19} /></span><span>Basket <b>{itemCount}</b></span><span className="basket-total">R{subtotal}</span></button>
      {toast && <div className="toast-message" role="status"><Check size={17} /> {toast}</div>}

      {(selectedRestaurant || cartOpen || checkoutOpen) && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) { setSelectedRestaurant(null); setCartOpen(false); setCheckoutOpen(false); } }}>
        {selectedRestaurant && <section className="side-panel" role="dialog" aria-modal="true" aria-label={`${selectedRestaurant.name} menu`}><div className={`panel-hero ${selectedRestaurant.theme}`}><button className="close-button" onClick={() => setSelectedRestaurant(null)} aria-label="Close menu"><X /></button><span>{selectedRestaurant.emoji}</span></div><div className="panel-body"><span className="kicker">{selectedRestaurant.category}</span><h2>{selectedRestaurant.name}</h2><p className="panel-desc">{selectedRestaurant.description} · ⭐ {selectedRestaurant.rating} · {selectedRestaurant.time}</p><h3 className="menu-heading">Popular on the menu</h3>{selectedRestaurant.items.map((item) => <div className="menu-item" key={item.name}><span className="menu-emoji">{item.emoji}</span><div className="menu-item-info"><b>{item.name}</b><span>Freshly prepared and full of flavour</span><strong>R{item.price}</strong></div><button className="quick-add" onClick={() => addItem(selectedRestaurant, item)} aria-label={`Add ${item.name}`}><Plus size={18} /></button></div>)}<button className="btn btn-primary full-width" onClick={() => { setSelectedRestaurant(null); setCartOpen(true); }}>View basket <ArrowRight size={16} /></button></div></section>}
        {cartOpen && !checkoutOpen && <section className="side-panel cart-panel" role="dialog" aria-modal="true" aria-label="Your basket"><div className="panel-top"><div><span className="kicker">YOUR ORDER</span><h2>Your basket</h2></div><button className="close-button plain" onClick={() => setCartOpen(false)} aria-label="Close basket"><X /></button></div>{cart.length === 0 ? <div className="empty-cart"><span>🛍️</span><h3>Your basket is waiting</h3><p>Add a few favourites from local restaurants to get started.</p><button className="btn btn-primary" onClick={() => { setCartOpen(false); jumpToRestaurants(); }}>Explore restaurants</button></div> : <><div className="cart-lines">{cart.map((line) => <div className="cart-line" key={line.key}><span className="menu-emoji">{line.emoji}</span><div className="cart-line-info"><b>{line.name}</b><small>{line.restaurantName}</small><strong>R{line.price * line.quantity}</strong></div><div className="quantity-control"><button onClick={() => changeQuantity(line.key, -1)} aria-label="Decrease quantity"><Minus size={13} /></button><b>{line.quantity}</b><button onClick={() => changeQuantity(line.key, 1)} aria-label="Increase quantity"><Plus size={13} /></button></div></div>)}</div><div className="fulfilment"><b>How would you like your order?</b><div className="fulfilment-options"><button className={fulfilment === 'Delivery' ? 'fulfilment-option active' : 'fulfilment-option'} onClick={() => setFulfilment('Delivery')}><Bike size={19} /><span><b>Delivery</b><small>R20 demo fee</small></span></button><button className={fulfilment === 'Collection' ? 'fulfilment-option active' : 'fulfilment-option'} onClick={() => setFulfilment('Collection')}><Store size={19} /><span><b>Collection</b><small>Pick it up</small></span></button></div></div><div className="order-summary"><div><span>Subtotal</span><b>R{subtotal}</b></div><div><span>{fulfilment} fee</span><b>{deliveryFee ? `R${deliveryFee}` : 'R0'}</b></div><div className="summary-total"><span>Total</span><b>R{total}</b></div><button className="btn btn-primary full-width" onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>Continue to checkout <ArrowRight size={16} /></button><p className="demo-disclaimer">Demo only. No payment will be collected.</p></div></>}</section>}
        {checkoutOpen && <section className="side-panel checkout-panel" role="dialog" aria-modal="true" aria-label="Checkout"><div className="panel-top"><div><span className="kicker">ALMOST THERE</span><h2>Checkout</h2></div><button className="close-button plain" onClick={() => setCheckoutOpen(false)} aria-label="Close checkout"><X /></button></div><form className="checkout-form" onSubmit={submitDemoOrder}><p className="muted">Enter your details to save a sample order on this device.</p><label>Your name<input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Thando Mokoena" /></label><label>Phone number<input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 071 234 5678" /></label>{fulfilment === 'Delivery' && <label>Delivery address<input required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, area, town" /></label>}<div className="checkout-callout"><span>{fulfilment === 'Delivery' ? '🛵' : '🛍️'}</span><div><b>{fulfilment}</b><small>{fulfilment === 'Delivery' ? 'Delivery fee: R20 (sample price)' : 'Collect your order from the restaurant'}</small></div></div><div className="order-summary"><div><span>Total (demo)</span><b>R{total}</b></div><button className="btn btn-primary full-width" type="submit">Place demo order <Check size={16} /></button><p className="demo-disclaimer">This does not contact a restaurant, charge you, or arrange a real delivery.</p></div></form></section>}
      </div>}
      <div className="firebase-status" title={hasFirebaseConfig ? 'Firebase environment values detected' : 'Firebase is not configured yet'}><span className={hasFirebaseConfig ? 'status-dot connected' : 'status-dot'} />{hasFirebaseConfig ? 'Firebase configured' : 'Preview mode'}</div>
    </div>
  );
}