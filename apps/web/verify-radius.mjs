const CENTER = { lat: -7.9666, lng: 112.6326 };
const RADIUS_M = 2000;
const PROJECT_ID = "cmticqi230000lcpv7n2tqsyx";

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function main() {
  const res = await fetch(`http://localhost:3000/api/research/${PROJECT_ID}/results`);
  const data = await res.json();

  console.log("=== RADIUS VERIFICATION ===");
  console.log(`Center: ${CENTER.lat}, ${CENTER.lng}`);
  console.log(`Radius: ${RADIUS_M}m (${RADIUS_M / 1000}km)`);
  console.log(`Total places: ${data.places.length}`);
  console.log("");

  const sorted = [...data.places].sort((a, b) => {
    const dA = haversine(CENTER.lat, CENTER.lng, a.latitude, a.longitude);
    const dB = haversine(CENTER.lat, CENTER.lng, b.latitude, b.longitude);
    return dA - dB;
  });

  let within = 0;
  let outside = 0;

  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    const dist = haversine(CENTER.lat, CENTER.lng, p.latitude, p.longitude);
    const distKm = (dist / 1000).toFixed(2);
    const ok = dist <= RADIUS_M;
    if (ok) within++;
    else outside++;
    const mark = ok ? "✅" : "❌";
    const phone = p.phone || "-";
    const emails = (p.emails || []).join(",") || "-";
    console.log(
      `${String(i + 1).padStart(2)}. ${mark} ${distKm}km | ${p.name} | 📞${phone} | 📧${emails}`,
    );
  }

  console.log("");
  console.log("=== SUMMARY ===");
  console.log(`✅ Within radius: ${within}/${data.places.length}`);
  console.log(`❌ Outside radius: ${outside}/${data.places.length}`);

  if (outside === 0) {
    console.log("");
    console.log("🎉 ALL PLACES WITHIN RADIUS — filtering works!");
  } else {
    console.log("");
    console.log("⚠️ Some places outside radius — filtering needs improvement");
  }
}

main().catch(console.error);
