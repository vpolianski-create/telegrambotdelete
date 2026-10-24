import { it, expect } from 'vitest';
import { generators } from '../src/generators';
import { generate } from '../src/generators';
import { seeded } from '../src/engine/rng';
it('все генераторы: ответ в вариантах, нет NaN и отрицательных ответов', () => {
  const bad: string[] = [];
  for (const name of Object.keys(generators)) for (const d of ['basic','advanced','bonus'] as const) for (let i=1;i<=150;i++){
    let t:any; try{ t=generate({generator:name,difficulty:d},{subject:'m',topicId:'t'},seeded(i)); }catch(e:any){bad.push(name+' '+d+' threw '+e.message);break;}
    if(t.type==='single'){ if(!t.options.includes(t.answer)) bad.push(`${name}: answer not in options: ${t.question}`); if(new Set(t.options).size!==t.options.length) bad.push(`${name}: dup options: ${t.question} ${t.options}`);}
    if(typeof t.answer==='number' && !Number.isFinite(t.answer)) bad.push(`${name}: NaN`);
    if(/NaN|undefined|Infinity/.test(JSON.stringify(t))) bad.push(`${name}: bad text ${t.question}`);
    if(t.type==='input' && typeof t.answer==='number' && t.answer<0) bad.push(`${name}: negative ${t.question}`);
  }
  expect(bad.length).toBe(0);
});
