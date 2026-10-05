// Selected writing checks. This is not an ASD-STE100 dictionary or grammar validator.
export function languageReport(content, label = 'input') {
  const findings = [];
  let fence = false, block = [], first = 1;
  const examine = () => {
    if (!block.length) return;
    const procedure = /^\s*(?:\d+[.)]|[-*])\s+/.test(block[0]);
    const text = block.join(' ').replace(/^\s*(?:\d+[.)]|[-*])\s+/, '').replace(/`[^`]+`/g, 'IDENTIFIER').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/\bNode\.js\b/g, 'Nodejs');
    const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z])/).filter((s) => s.trim());
    const limit = procedure ? 20 : 25;
    for (const sentence of sentences) {
      const count = sentence.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
      if (count > limit) findings.push({rule:'sentence-length',severity:'error',line:first,message:`Sentence has ${count} words; limit ${limit}.`});
      if (/\b\w+(?:n't|'re|'ve|'ll|'d|'m)\b|\b(?:it|that|there|what|let|here|who)'s\b/i.test(sentence)) findings.push({rule:'contraction',severity:'error',line:first,message:'Use the full word forms.'});
      if (/^(?:Check|Review|Create|Ensure|Avoid|Confirm|Preserve)\b/.test(sentence)) findings.push({rule:'general-verb',severity:'error',line:first,message:'Examine the verb against the STE dictionary.'});
      if (/\b(?:should|might|ought)\b/i.test(sentence)) findings.push({rule:'weak-instruction',severity:'warning',line:first,message:'Examine the instruction strength.'});
    }
    if (!procedure && sentences.length > 6) findings.push({rule:'paragraph-length',severity:'error',line:first,message:'Use at most six sentences in a paragraph.'});
    block = [];
  };
  let front = content.startsWith('---\n'), opening = true;
  for (const [index,line] of content.split(/\r?\n/).entries()) {
    if (front) { if (line === '---') { if (opening) opening = false; else front = false; } continue; }
    if (/^\s*(?:```|~~~)/.test(line)) { examine(); fence = !fence; continue; }
    if (fence) continue;
    if (!line.trim() || /^#{1,6}\s/.test(line) || /^\|/.test(line)) { examine(); continue; }
    if (/^\s*(?:\d+[.)]|[-*])\s+/.test(line)) examine();
    if (!block.length) first = index+1;
    block.push(line.trim());
  }
  examine();
  return {file:label,standard:'ASD-STE100 Issue 9',coverage:'selected length, contraction, and verb checks; no dictionary, grammar, or meaning certification',errors:findings.filter((f) => f.severity === 'error').length,warnings:findings.filter((f) => f.severity === 'warning').length,findings};
}
