import { useState, useEffect } from 'react';
import API from '../api';

const STATE_CODES = {
  'Jammu & Kashmir':'01','Himachal Pradesh':'02','Punjab':'03','Chandigarh':'04',
  'Uttarakhand':'05','Haryana':'06','Delhi':'07','Rajasthan':'08','Uttar Pradesh':'09',
  'Bihar':'10','Sikkim':'11','Arunachal Pradesh':'12','Nagaland':'13','Manipur':'14',
  'Mizoram':'15','Tripura':'16','Meghalaya':'17','Assam':'18','West Bengal':'19',
  'Jharkhand':'20','Odisha':'21','Chhattisgarh':'22','Madhya Pradesh':'23','Gujarat':'24',
  'Maharashtra':'27','Andhra Pradesh':'28','Karnataka':'29','Goa':'30','Kerala':'32',
  'Tamil Nadu':'33','Puducherry':'34','Telangana':'36',
};

const emptyItem = () => ({ description: '', hsnCode: '', uom: '', quantity: '', rate: '', value: 0 });

export default function InvoiceForm({ editInvoice, onSave, onBack }) {
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [reverseCharge, setReverseCharge] = useState(false);
  const [vehicleNo, setVehicleNo] = useState('');
  const [supplyDate, setSupplyDate] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('');
  const [billedName, setBilledName] = useState('');
  const [billedAddr, setBilledAddr] = useState('');
  const [billedPin, setBilledPin] = useState('');
  const [billedCity, setBilledCity] = useState('');
  const [billedState, setBilledState] = useState('');
  const [billedStateCode, setBilledStateCode] = useState('');
  const [billedGstin, setBilledGstin] = useState('');
  const [shippedName, setShippedName] = useState('');
  const [shippedAddr, setShippedAddr] = useState('');
  const [shippedPin, setShippedPin] = useState('');
  const [shippedCity, setShippedCity] = useState('');
  const [shippedState, setShippedState] = useState('');
  const [shippedStateCode, setShippedStateCode] = useState('');
  const [shippedGstin, setShippedGstin] = useState('');
  const [items, setItems] = useState([emptyItem(), emptyItem(), emptyItem()]);
  const [sgstRate, setSgstRate] = useState(0);
  const [cgstRate, setCgstRate] = useState(0);
  const [igstRate, setIgstRate] = useState(0);
  const [freight, setFreight] = useState(0);
  const [ewbNo, setEwbNo] = useState('');
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (editInvoice) loadEditData(editInvoice);
    else fetchNextNumber();
    fetchAllInvoices();
  }, []);

  const fetchAllInvoices = async () => {
    try { const res = await API.get('/api/invoices'); setAllInvoices(res.data); } catch (e) {}
  };

  const fetchNextNumber = async () => {
    try { const res = await API.get('/api/invoices/next-number'); setInvoiceNo(res.data.invoiceNo); } catch (e) {}
  };

  const loadEditData = (inv) => {
    setInvoiceNo(inv.invoiceNo||''); setInvoiceDate(inv.invoiceDate||'');
    setReverseCharge(inv.reverseCharge||false); setVehicleNo(inv.vehicleNo||'');
    setSupplyDate(inv.supplyDate||''); setPlaceOfSupply(inv.placeOfSupply||'');
    setBilledName(inv.billedName||''); setBilledAddr(inv.billedAddr||'');
    setBilledPin(inv.billedPin||''); setBilledCity(inv.billedCity||'');
    setBilledState(inv.billedState||''); setBilledStateCode(inv.billedStateCode||'');
    setBilledGstin(inv.billedGstin||''); setShippedName(inv.shippedName||'');
    setShippedAddr(inv.shippedAddr||''); setShippedPin(inv.shippedPin||'');
    setShippedCity(inv.shippedCity||''); setShippedState(inv.shippedState||'');
    setShippedStateCode(inv.shippedStateCode||''); setShippedGstin(inv.shippedGstin||'');
    setSgstRate(inv.sgstRate||0); setCgstRate(inv.cgstRate||0);
    setIgstRate(inv.igstRate||0); setFreight(inv.freight||0);
    setEwbNo(inv.ewbNo||'');
    setItems(inv.items?.length ? inv.items : [emptyItem()]);
  };

  const fetchPincode = async (pin, prefix) => {
    if (pin.length !== 6) return;
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data[0].Status === 'Success') {
        const po = data[0].PostOffice[0];
        const code = STATE_CODES[po.State] || '';
        if (prefix === 'billed') {
          setBilledCity(po.District||po.Block||''); setBilledState(po.State||''); setBilledStateCode(code);
          if (!placeOfSupply) setPlaceOfSupply(po.District||po.State||'');
        } else {
          setShippedCity(po.District||po.Block||''); setShippedState(po.State||''); setShippedStateCode(code);
        }
      }
    } catch (e) {}
  };

  const decodeGstin = (gstin, prefix) => {
    const code = gstin.substring(0, 2);
    const state = Object.keys(STATE_CODES).find(k => STATE_CODES[k] === code);
    if (!state) return;
    if (prefix === 'billed') { setBilledState(state); setBilledStateCode(code); }
    else { setShippedState(state); setShippedStateCode(code); }
  };

  const showSuggestions = (val) => {
    if (!val) { setSuggestions([]); return; }
    const unique = {};
    allInvoices.forEach(inv => { if (inv.billedName) unique[inv.billedName] = inv; });
    setSuggestions(Object.values(unique).filter(inv =>
      inv.billedName.toLowerCase().includes(val.toLowerCase())).slice(0, 5));
  };

  const fillParty = (inv) => {
    setBilledName(inv.billedName||''); setBilledAddr(inv.billedAddr||'');
    setBilledPin(inv.billedPin||''); setBilledCity(inv.billedCity||'');
    setBilledState(inv.billedState||''); setBilledStateCode(inv.billedStateCode||'');
    setBilledGstin(inv.billedGstin||''); setSuggestions([]);
  };

  const updateItem = (idx, field, val) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: val };
    if (field === 'quantity' || field === 'rate') {
      const qty = parseFloat(field === 'quantity' ? val : updated[idx].quantity) || 0;
      const rate = parseFloat(field === 'rate' ? val : updated[idx].rate) || 0;
      updated[idx].value = qty * rate;
    }
    setItems(updated);
  };

  const addItem = () => setItems([...items, emptyItem()]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, i) => s + (parseFloat(i.value) || 0), 0);
  const sgstAmt = subtotal * (parseFloat(sgstRate) || 0) / 100;
  const cgstAmt = subtotal * (parseFloat(cgstRate) || 0) / 100;
  const igstAmt = subtotal * (parseFloat(igstRate) || 0) / 100;
  const grandTotal = subtotal + sgstAmt + cgstAmt + igstAmt + (parseFloat(freight) || 0);

  const setGST = (c, s, i) => { setCgstRate(c); setSgstRate(s); setIgstRate(i); };

  const numberToWords = (n) => {
    if (!n || n === 0) return 'Zero';
    const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    const h = (n) => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' '+ones[n%10] : '');
      if (n < 1000) return ones[Math.floor(n/100)]+' Hundred'+(n%100 ? ' '+h(n%100) : '');
      if (n < 100000) return h(Math.floor(n/1000))+' Thousand'+(n%1000 ? ' '+h(n%1000) : '');
      if (n < 10000000) return h(Math.floor(n/100000))+' Lakh'+(n%100000 ? ' '+h(n%100000) : '');
      return h(Math.floor(n/10000000))+' Crore'+(n%10000000 ? ' '+h(n%10000000) : '');
    };
    return h(Math.round(n));
  };

  const handleSave = async () => {
    if (!invoiceNo || !billedName) { setSaveError('Invoice No. aur Party Name zaroori hai'); return; }
    setSaving(true); setSaveError('');
    const payload = {
      invoiceNo, invoiceDate, reverseCharge, vehicleNo, supplyDate, placeOfSupply,
      billedName, billedAddr, billedPin, billedCity, billedState, billedStateCode, billedGstin,
      shippedName, shippedAddr, shippedPin, shippedCity, shippedState, shippedStateCode, shippedGstin,
      sgstRate: parseFloat(sgstRate)||0, cgstRate: parseFloat(cgstRate)||0,
      igstRate: parseFloat(igstRate)||0, freight: parseFloat(freight)||0, ewbNo,
      items: items.filter(i => i.description).map((item, idx) => ({
        sno: idx+1, description: item.description||'', hsnCode: item.hsnCode||'',
        uom: item.uom||'', quantity: parseFloat(item.quantity)||0,
        rate: parseFloat(item.rate)||0, value: parseFloat(item.value)||0,
      })),
    };
    try {
      if (editInvoice) await API.put(`/api/invoices/${editInvoice.id}`, payload);
      else await API.post('/api/invoices', payload);
      onSave();
    } catch (err) {
      console.error('Save error full:', err.response || err);
      setSaveError('Error: ' + (err.response?.data?.message || err.response?.data || err.message || 'Check console F12'));
    } finally { setSaving(false); }
  };

  const R = (label, val) => (
    <div style={s.row}>
      <span style={s.rowLabel}>{label}</span>
      <span style={s.rowVal}>{val || '—'}</span>
    </div>
  );

  return (
    <div>
      {/* Top Bar */}
      <div className="no-print" style={s.topbar}>
        <h2 style={s.title}>{editInvoice ? 'Edit Invoice' : 'New Invoice'}</h2>
        <button style={s.btnBack} onClick={onBack}>← Back</button>
      </div>

      {saveError && (
        <div className="no-print" style={s.errBox}>❌ {saveError}</div>
      )}

      {/* Invoice Paper */}
      <div className="invoice-paper" style={s.paper}>

        {/* ===== COMPACT HEADER ===== */}
        <div style={s.headerWrap}>
          {/* Left: GSTIN + Company */}
          <div style={s.headerLeft}>
            <div style={s.gstSmall}>GSTIN: 09AGOPA6566D2Z9</div>
            <div style={s.companyName}>S Four Traders</div>
            <div style={s.companyAddr}>Opp. Vardhman Refractory, Shamli Bypass Road, Muzaffarnagar (U.P.)</div>
          </div>
          {/* Center: TAX INVOICE */}
          <div style={s.headerCenter}>
            <div style={s.taxInvoice}>TAX INVOICE</div>
          </div>
          {/* Right: Phone */}
          <div style={s.headerRight}>
            <div style={s.phone}>📞 8279444622</div>
            <div style={s.stateInfo}>State: U.P. | Code: 09</div>
          </div>
        </div>

        {/* ===== META ROW — compact single row ===== */}
        <div style={s.metaStrip}>
          {/* Invoice No */}
          <div style={s.metaCell}>
            <div style={s.metaLabel}>Invoice No.</div>
            <input style={s.metaInput} value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} />
          </div>
          <div style={s.metaDivider}/>
          {/* Date */}
          <div style={s.metaCell}>
            <div style={s.metaLabel}>Date</div>
            <input style={s.metaInput} type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
          </div>
          <div style={s.metaDivider}/>
          {/* Vehicle */}
          <div style={s.metaCell}>
            <div style={s.metaLabel}>Vehicle No.</div>
            <input style={s.metaInput} value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} placeholder="UP14CD-1234" />
          </div>
          <div style={s.metaDivider}/>
          {/* Supply Date */}
          <div style={s.metaCell}>
            <div style={s.metaLabel}>Date & Time of Supply</div>
            <input style={s.metaInput} type="datetime-local" value={supplyDate} onChange={e => setSupplyDate(e.target.value)} />
          </div>
          <div style={s.metaDivider}/>
          {/* Place */}
          <div style={s.metaCell}>
            <div style={s.metaLabel}>Place of Supply</div>
            <input style={s.metaInput} value={placeOfSupply} onChange={e => setPlaceOfSupply(e.target.value)} placeholder="Dehradun" />
          </div>
          <div style={s.metaDivider}/>
          {/* Reverse Charge */}
          <div style={s.metaCell}>
            <div style={s.metaLabel}>Reverse Charge</div>
            <label style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px' }}>
              <input type="checkbox" checked={reverseCharge} onChange={e => setReverseCharge(e.target.checked)} />
              {reverseCharge ? 'Yes' : 'No'}
            </label>
          </div>
        </div>

        {/* ===== PARTY ROW ===== */}
        <div style={s.partyRow}>
          {/* Billed To */}
          <div style={s.partyBox}>
            <div style={s.partyTitle}>Details of Receiver / Billed To</div>
            <div style={{ position:'relative' }}>
              <CF label="Name" value={billedName}
                onChange={e => { setBilledName(e.target.value); showSuggestions(e.target.value); }}
                onBlur={() => setTimeout(() => setSuggestions([]), 200)} placeholder="Party Name" />
              {suggestions.length > 0 && (
                <div style={s.suggestBox}>
                  {suggestions.map(inv => (
                    <div key={inv.id} style={s.suggestItem} onMouseDown={() => fillParty(inv)}>
                      <b>{inv.billedName}</b>
                      <span style={{ fontSize:'10px', color:'#888', fontFamily:'monospace' }}> {inv.billedGstin}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <CF label="Address" value={billedAddr} onChange={e => setBilledAddr(e.target.value)} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
              <CF label="Pincode" value={billedPin} onChange={e => { setBilledPin(e.target.value); fetchPincode(e.target.value,'billed'); }} maxLength={6} placeholder="6 digits" />
              <CF label="City" value={billedCity} onChange={e => setBilledCity(e.target.value)} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'6px' }}>
              <CF label="State" value={billedState} onChange={e => setBilledState(e.target.value)} />
              <CF label="Code" value={billedStateCode} onChange={e => setBilledStateCode(e.target.value)} />
              <CF label="GSTIN" value={billedGstin}
                onChange={e => { const v=e.target.value.toUpperCase(); setBilledGstin(v); if(v.length===15) decodeGstin(v,'billed'); }}
                maxLength={15} placeholder="GSTIN" />
            </div>
          </div>

          {/* Shipped To */}
          <div style={{ ...s.partyBox, borderRight:'none' }}>
            <div style={s.partyTitle}>Details of Consignee / Shipped To</div>
            <CF label="Name" value={shippedName} onChange={e => setShippedName(e.target.value)} placeholder="If different" />
            <CF label="Address" value={shippedAddr} onChange={e => setShippedAddr(e.target.value)} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
              <CF label="Pincode" value={shippedPin} onChange={e => { setShippedPin(e.target.value); fetchPincode(e.target.value,'shipped'); }} maxLength={6} placeholder="6 digits" />
              <CF label="City" value={shippedCity} onChange={e => setShippedCity(e.target.value)} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'6px' }}>
              <CF label="State" value={shippedState} onChange={e => setShippedState(e.target.value)} />
              <CF label="Code" value={shippedStateCode} onChange={e => setShippedStateCode(e.target.value)} />
              <CF label="GSTIN" value={shippedGstin}
                onChange={e => { const v=e.target.value.toUpperCase(); setShippedGstin(v); if(v.length===15) decodeGstin(v,'shipped'); }}
                maxLength={15} placeholder="GSTIN" />
            </div>
          </div>
        </div>

        {/* GST Quick Bar */}
        <div className="no-print" style={s.gstBar}>
          <span style={{ fontSize:'11px', fontWeight:'700', color:'#666', marginRight:'4px' }}>Quick GST:</span>
          {[['0%',0,0,0],['5%',2.5,2.5,0],['12%',6,6,0],['18%',9,9,0],['28%',14,14,0],
            ['5% IGST',0,0,5],['12% IGST',0,0,12],['18% IGST',0,0,18],['28% IGST',0,0,28]].map(([l,c,ss,i]) => (
            <button key={l} style={s.gstChip} onClick={() => setGST(c,ss,i)}>{l}</button>
          ))}
        </div>

        {/* Items Table */}
        <table style={s.itemTable}>
          <thead>
            <tr>
              {['S.No','Description of Goods','HSN','UOM','Qty','Rate','Value',''].map(h => (
                <th key={h} style={s.itemTh}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ ...s.itemTd, textAlign:'center', color:'#888', width:'36px' }}>{idx+1}</td>
                <td style={s.itemTd}><input style={{ ...s.itemInput, textAlign:'left' }} value={item.description} onChange={e => updateItem(idx,'description',e.target.value)} placeholder="Description" /></td>
                <td style={{ ...s.itemTd, width:'64px' }}><input style={s.itemInput} value={item.hsnCode} onChange={e => updateItem(idx,'hsnCode',e.target.value)} /></td>
                <td style={{ ...s.itemTd, width:'48px' }}><input style={s.itemInput} value={item.uom} onChange={e => updateItem(idx,'uom',e.target.value)} /></td>
                <td style={{ ...s.itemTd, width:'56px' }}><input style={s.itemInput} type="number" value={item.quantity} onChange={e => updateItem(idx,'quantity',e.target.value)} /></td>
                <td style={{ ...s.itemTd, width:'72px' }}><input style={s.itemInput} type="number" value={item.rate} onChange={e => updateItem(idx,'rate',e.target.value)} /></td>
                <td style={{ ...s.itemTd, width:'88px' }}><input style={{ ...s.itemInput, color:'#555' }} readOnly value={(parseFloat(item.value)||0).toFixed(2)} /></td>
                <td style={{ ...s.itemTd, width:'28px' }} className="no-print">
                  <button onClick={() => removeItem(idx)} style={{ background:'none', border:'none', cursor:'pointer', color:'#c0272d', fontSize:'15px' }}>×</button>
                </td>
              </tr>
            ))}
            {/* Empty rows for print */}
            {Array.from({ length: Math.max(0, 5 - items.length) }).map((_, i) => (
              <tr key={'empty-'+i}>
                <td style={s.itemTd}>&nbsp;</td>
                <td style={s.itemTd}></td><td style={s.itemTd}></td>
                <td style={s.itemTd}></td><td style={s.itemTd}></td>
                <td style={s.itemTd}></td><td style={s.itemTd}></td>
                <td style={s.itemTd} className="no-print"></td>
              </tr>
            ))}
            <tr style={{ background:'#f4f4f4' }}>
              <td colSpan="5" style={{ ...s.itemTd, textAlign:'right', fontWeight:'600', fontSize:'11px', color:'#555' }}>Total</td>
              <td style={s.itemTd}></td>
              <td style={{ ...s.itemTd, fontFamily:'monospace', fontWeight:'700', textAlign:'right' }}>₹{subtotal.toFixed(2)}</td>
              <td className="no-print"></td>
            </tr>
          </tbody>
        </table>

        <button className="no-print" style={s.addBtn} onClick={addItem}>+ Add Item</button>

        {/* Footer: Words + Totals */}
        <div style={s.footer}>
          <div style={{ flex:1 }}>
            <div style={s.wordsLabel}>Total Invoice Amount in Words</div>
            <div style={s.wordsBox}>{numberToWords(Math.round(grandTotal))} Rupees Only</div>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', marginTop:'8px', fontSize:'11px' }}>
              <b style={{ color:'#555', whiteSpace:'nowrap' }}>E-Way Bill No.:</b>
              <input style={{ flex:1, border:'none', borderBottom:'1px solid #ddd', fontFamily:'monospace', fontSize:'11px', outline:'none' }}
                value={ewbNo} onChange={e => setEwbNo(e.target.value)} placeholder="Will be generated" />
            </div>
          </div>

          <div style={s.totalsBox}>
            {[
              ['Total', `₹${subtotal.toFixed(2)}`],
              [`SGST @${sgstRate}%`, `₹${sgstAmt.toFixed(2)}`],
              [`CGST @${cgstRate}%`, `₹${cgstAmt.toFixed(2)}`],
              [`IGST @${igstRate}%`, `₹${igstAmt.toFixed(2)}`],
              ['Freight', <input key="f" type="number" value={freight} onChange={e => setFreight(e.target.value)}
                style={{ width:'70px', border:'none', borderBottom:'1px solid #ddd', textAlign:'right', fontFamily:'monospace', fontSize:'11px', outline:'none' }} />],
            ].map(([label, val], i) => (
              <div key={i} style={{ ...s.totalRow, background: i>0 && i<4 ? '#f9f9f9':'white' }}>
                <span style={{ color:'#666' }}>{label}</span>
                <span style={{ fontFamily:'monospace', fontWeight:'600' }}>{val}</span>
              </div>
            ))}
            <div style={{ ...s.totalRow, background:'#1a1a1a', color:'white', fontWeight:'700' }}>
              <span style={{ color:'#ccc' }}>Grand Total</span>
              <span style={{ fontFamily:'monospace' }}>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div style={s.signRow}>
          <div style={{ fontSize:'9px', color:'#666', lineHeight:'1.8' }}>
            <b style={{ display:'block', marginBottom:'3px', fontSize:'10px' }}>Terms & Conditions</b>
            • Goods once sold will not be taken back.<br/>
            • All Disputes Subject to Muzaffarnagar Jurisdiction Only.<br/>
            • E & O.E.
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:'9px', color:'#666' }}>Certified that the particulars given above are true & correct.</div>
            <div style={{ fontFamily:'Georgia,serif', color:'#c0272d', fontSize:'15px', fontWeight:'700', marginTop:'3px' }}>For S Four Traders</div>
            <div style={{ fontSize:'9px', color:'#888', marginTop:'24px', borderTop:'1px solid #ddd', paddingTop:'3px' }}>Prop. / Auth. Signatory</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="no-print" style={s.actions}>
        {saveError && <span style={{ color:'#c0272d', fontSize:'12px', flex:1 }}>❌ {saveError}</span>}
        <button style={s.btnSecondary} onClick={() => window.print()}>🖨 Print</button>
        <button style={{ ...s.btnPrimary, opacity:saving?0.7:1 }} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : editInvoice ? '💾 Update' : '💾 Save Invoice'}
        </button>
      </div>
    </div>
  );
}

// Compact Field Component
function CF({ label, value, onChange, type='text', placeholder, maxLength, onBlur }) {
  return (
    <div style={{ marginBottom:'6px' }}>
      <div style={{ fontSize:'9px', fontWeight:'700', color:'#888', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:'2px' }}>{label}</div>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        maxLength={maxLength} onBlur={onBlur}
        style={{ width:'100%', border:'none', borderBottom:'1px solid #e0e0e0', padding:'3px 2px', fontSize:'12px', outline:'none', background:'transparent', boxSizing:'border-box' }} />
    </div>
  );
}

const s = {
  topbar: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' },
  title: { fontFamily:'Georgia,serif', fontSize:'22px', margin:0 },
  btnBack: { padding:'7px 14px', background:'white', border:'1.5px solid #e0e0e0', borderRadius:'7px', cursor:'pointer', fontSize:'13px' },
  errBox: { background:'#fee2e2', color:'#c0272d', padding:'10px 16px', borderRadius:'8px', marginBottom:'12px', fontSize:'13px', maxWidth:'960px', margin:'0 auto 12px' },
  paper: { background:'white', borderRadius:'10px', boxShadow:'0 4px 24px rgba(0,0,0,0.1)', overflow:'hidden', maxWidth:'960px', margin:'0 auto' },

  /* Compact header - all in one row */
  headerWrap: { display:'grid', gridTemplateColumns:'1fr auto 1fr', alignItems:'center', padding:'10px 16px', borderBottom:'2px solid #c0272d' },
  headerLeft: {},
  gstSmall: { fontSize:'10px', color:'#888', fontFamily:'monospace', marginBottom:'2px' },
  companyName: { fontFamily:'Georgia,serif', color:'#c0272d', fontSize:'24px', fontWeight:'800', lineHeight:1 },
  companyAddr: { fontSize:'10px', color:'#666', marginTop:'2px' },
  headerCenter: { textAlign:'center', padding:'0 16px' },
  taxInvoice: { fontSize:'13px', fontWeight:'700', letterSpacing:'3px', textTransform:'uppercase', background:'#f4f4f4', padding:'6px 16px', borderRadius:'4px', border:'1px solid #e0e0e0' },
  headerRight: { textAlign:'right' },
  phone: { fontWeight:'700', fontSize:'14px', color:'#1a1a1a' },
  stateInfo: { fontSize:'10px', color:'#888', marginTop:'2px' },

  /* Meta strip — single compact row */
  metaStrip: { display:'flex', borderBottom:'1px solid #e0e0e0', background:'#fafafa' },
  metaCell: { flex:1, padding:'8px 10px' },
  metaDivider: { width:'1px', background:'#e0e0e0', margin:'4px 0' },
  metaLabel: { fontSize:'9px', fontWeight:'700', color:'#888', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:'3px' },
  metaInput: { width:'100%', border:'none', background:'transparent', fontSize:'12px', outline:'none', fontFamily:'inherit', fontWeight:'600', color:'#1a1a1a' },

  partyRow: { display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom:'1px solid #e0e0e0' },
  partyBox: { padding:'10px 14px', borderRight:'1px solid #e0e0e0' },
  partyTitle: { fontSize:'9px', fontWeight:'700', color:'#c0272d', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px', paddingBottom:'4px', borderBottom:'1px solid #eee' },
  suggestBox: { position:'absolute', top:'100%', left:0, right:0, background:'white', border:'1.5px solid #c0272d', borderRadius:'6px', zIndex:50, boxShadow:'0 4px 16px rgba(0,0,0,0.1)', maxHeight:'160px', overflowY:'auto' },
  suggestItem: { padding:'7px 12px', cursor:'pointer', borderBottom:'1px solid #eee', fontSize:'12px' },
  gstBar: { display:'flex', alignItems:'center', gap:'5px', flexWrap:'wrap', padding:'7px 14px', background:'#fdf6e3', borderBottom:'1px solid #e8d89a' },
  gstChip: { padding:'3px 9px', borderRadius:'20px', border:'1px solid #c9a84c', background:'white', fontSize:'11px', fontWeight:'600', color:'#854d0e', cursor:'pointer' },
  itemTable: { width:'100%', borderCollapse:'collapse' },
  itemTh: { background:'#1a1a1a', color:'white', fontSize:'10px', fontWeight:'600', textTransform:'uppercase', padding:'7px 6px', textAlign:'center' },
  itemTd: { padding:'4px 6px', borderBottom:'1px solid #e0e0e0', verticalAlign:'middle' },
  itemInput: { width:'100%', border:'none', background:'transparent', fontFamily:'inherit', fontSize:'12px', textAlign:'center', outline:'none', padding:'1px 2px' },
  addBtn: { margin:'6px 14px', fontSize:'11px', color:'#c0272d', background:'none', border:'1px dashed #c0272d', padding:'4px 12px', borderRadius:'5px', cursor:'pointer' },
  footer: { display:'flex', gap:'16px', padding:'12px 14px', borderTop:'1px solid #e0e0e0', alignItems:'start' },
  wordsLabel: { fontSize:'9px', fontWeight:'700', color:'#666', textTransform:'uppercase', marginBottom:'5px' },
  wordsBox: { fontSize:'11px', fontWeight:'600', background:'#fdf6e3', border:'1px solid #e8d89a', borderRadius:'4px', padding:'6px 8px', minHeight:'36px' },
  totalsBox: { minWidth:'220px', border:'1px solid #e0e0e0', borderRadius:'6px', overflow:'hidden', flexShrink:0 },
  totalRow: { display:'flex', justifyContent:'space-between', padding:'5px 10px', fontSize:'11px', borderBottom:'1px solid #eee' },
  signRow: { display:'flex', justifyContent:'space-between', alignItems:'flex-end', padding:'10px 14px', borderTop:'1px solid #e0e0e0' },
  actions: { display:'flex', gap:'10px', justifyContent:'flex-end', alignItems:'center', marginTop:'14px', maxWidth:'960px', margin:'14px auto 0' },
  btnPrimary: { padding:'9px 20px', background:'#c0272d', color:'white', border:'none', borderRadius:'7px', fontSize:'13px', fontWeight:'600', cursor:'pointer' },
  btnSecondary: { padding:'9px 20px', background:'white', color:'#333', border:'1.5px solid #e0e0e0', borderRadius:'7px', fontSize:'13px', cursor:'pointer' },
  row: { display:'flex', gap:'6px', marginBottom:'3px' },
  rowLabel: { fontSize:'10px', color:'#888', fontWeight:'600', minWidth:'80px' },
  rowVal: { fontSize:'11px', color:'#1a1a1a' },
};