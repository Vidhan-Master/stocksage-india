/** Format number in Indian style: 1,42,500.75 */
export function formatINR(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  const isNeg = amount < 0;
  const abs = Math.abs(amount);
  const [intPart, decPart] = abs.toFixed(2).split(".");
  
  // Indian grouping: last 3, then pairs of 2
  let result = "";
  if (intPart.length <= 3) {
    result = intPart;
  } else {
    result = intPart.slice(-3);
    let remaining = intPart.slice(0, -3);
    while (remaining.length > 2) {
      result = remaining.slice(-2) + "," + result;
      remaining = remaining.slice(0, -2);
    }
    if (remaining) result = remaining + "," + result;
  }
  
  return `${isNeg ? "-" : ""}₹${result}.${decPart}`;
}

/** Format large numbers: 1.5Cr, 25.3L, 50K */
export function formatCompact(num: number): string {
  const abs = Math.abs(num);
  if (abs >= 10000000) return `${(num / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `${(num / 100000).toFixed(2)}L`;
  if (abs >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(2);
}

/** Color class based on positive/negative */
export function changeColor(value: number): string {
  if (value > 0) return "text-green-400";
  if (value < 0) return "text-red-400";
  return "text-gray-400";
}

/** Background color for signals */
export function signalColor(signal: string): string {
  switch (signal) {
    case "BUY": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "SELL": return "bg-red-500/20 text-red-400 border-red-500/30";
    default: return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  }
}
