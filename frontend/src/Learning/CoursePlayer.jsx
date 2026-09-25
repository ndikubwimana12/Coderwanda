import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Lock, PlayCircle, BookOpen, Trophy } from 'lucide-react';
import useRemote from '../Utils/useRemote';
import api from '../Utils/api';
import DataState from '../Components/DataState';
import LearningShell from './LearningShell';
import UnitPractice from './UnitPractice';
function Unit({ unit, onStudied }) {
  const remote = useRemote(`/learning/units/${unit.id}`, null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function studied() {
    setBusy(true); setMessage('');
    try { await api.post(`/learning/units/${unit.id}/studied`); onStudied(); setMessage('Study progress saved. Continue with the practical tasks and assessment below.'); }
    catch (error) { setMessage(error.response?.data?.error || 'Unable to save your progress.'); }
    finally { setBusy(false); }
  }
  return <div><DataState {...remote} />{remote.data && <article className="space-y-6"><div><p className="text-xs font-bold uppercase tracking-wider text-purple-700">Learning unit · {remote.data.duration_minutes} minutes</p><h2 className="mt-2 text-2xl font-black">{remote.data.title}</h2></div>{remote.data.video_url && <video key={remote.data.video_url} controls controlsList="nodownload" preload="metadata" className="aspect-video w-full rounded-2xl bg-slate-950" src={remote.data.video_url}>Your browser does not support this video.</video>}{remote.data.image_url && <img src={remote.data.image_url} alt={remote.data.title} className="max-h-[420px] w-full rounded-xl object-contain" />}{remote.data.content && <div className="whitespace-pre-wrap text-base leading-8 text-slate-700">{remote.data.content}</div>}<UnitPractice unitId={unit.id} /><div className="rounded-2xl border border-purple-100 bg-purple-50 p-5"><h3 className="font-bold">Turn this lesson into knowledge</h3><p className="mt-1 text-sm text-slate-600">Review the content, then pass the assessment and any required practical tasks to finish this unit.</p><div className="mt-4 flex flex-wrap gap-3"><button disabled={busy || !!unit.read_at} onClick={studied} className="rounded-xl bg-purple-700 px-4 py-3 font-bold text-white disabled:opacity-50">{unit.read_at ? 'Content studied ✓' : busy ? 'Saving…' : 'I have studied this unit'}</button>{unit.assessment_id && unit.read_at ? <Link to={`/learn/assessments/${unit.assessment_id}`} className="rounded-xl border border-purple-300 bg-white px-4 py-3 font-bold text-purple-800">{unit.completed_at ? 'Review assessment' : 'Take assessment'}</Link> : !unit.assessment_id && !unit.practicals_total && <p className="self-center text-sm text-slate-500">Your instructor is preparing this unit’s assessment.</p>}</div>{message && <p role="status" className="mt-3 text-sm">{message}</p>}</div></article>}</div>;
}
export default function CoursePlayer() {
  const { courseId } = useParams();
  const remote = useRemote(`/learning/courses/${courseId}`, null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(null);
  const data = remote.data;
  const unit = data?.units.find(unit => unit.id === selected);
  async function join(module) {
    setJoining(module.id); setError('');
    try { await api.post(`/learning/modules/${module.id}/enroll`); remote.reload(); }
    catch (error) { setError(error.response?.data?.error || 'Unable to enroll in this module.'); }
    finally { setJoining(null); }
  }
  return <LearningShell><Link to="/learn" className="mb-5 inline-block text-sm font-bold text-purple-700">← My learning</Link><DataState {...remote} />{data && <>
    <div className="mb-7"><Link className="float-right text-sm font-bold text-purple-700" to={`/learn/courses/${courseId}/chat`}>Open classroom chat →</Link><p className="text-xs font-bold uppercase tracking-widest text-purple-700">{data.course.category}</p><h1 className="mt-2 text-3xl font-black">{data.course.title}</h1><div className="mt-4 flex items-center gap-4"><progress className="h-2 w-64 max-w-[65%] accent-purple-700" value={data.completed} max={data.total || 1} /><span className="text-sm text-slate-500">{data.completed} of {data.total} units completed</span></div></div>
    {error && <p role="alert" className="mb-4 text-red-700">{error}</p>}
    <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]"><aside className="space-y-4"><h2 className="font-bold">Your course plan</h2>{!data.modules.length && <p className="rounded-xl bg-white p-5 text-slate-500">Your instructor is preparing the course. Check back soon.</p>}{data.modules.map((module, index) => <section key={module.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="p-4"><p className="text-xs font-bold text-purple-600">MODULE {index + 1}</p><h3 className="mt-1 font-bold">{module.title}</h3><p className="mt-2 text-sm text-slate-500">{module.description}</p>{!module.enrolled_at && <button disabled={joining === module.id} onClick={() => join(module)} className="mt-3 w-full rounded-lg bg-purple-700 px-4 py-2 font-bold text-white">{joining === module.id ? 'Joining…' : 'Enroll in module'}</button>}</div>{module.enrolled_at && <ol className="border-t border-slate-100">{module.units.map((item, unitIndex) => { const locked = module.units.slice(0, unitIndex).some(previous => !previous.completed_at); return <li key={item.id}><button disabled={locked} onClick={() => setSelected(item.id)} className={`flex w-full items-start gap-3 p-4 text-left text-sm disabled:opacity-40 ${selected === item.id ? 'bg-purple-50 text-purple-800' : 'hover:bg-slate-50'}`}>{item.completed_at ? <CheckCircle2 size={18} className="shrink-0 text-emerald-600" /> : locked ? <Lock size={18} className="shrink-0" /> : <PlayCircle size={18} className="shrink-0 text-purple-600" />}<span>{item.title}<span className="mt-1 block text-xs text-slate-400">{item.duration_minutes} min {item.completed_at ? '· Completed' : ''}</span></span></button></li>; })}</ol>}</section>)}<section className="rounded-2xl border border-purple-200 bg-purple-50 p-5"><Trophy className="text-purple-700" /><h3 className="mt-3 font-bold">Final exam & certificate</h3><p className="my-3 text-sm text-slate-600">Pass the unit assessments and required practicals to unlock your final exam.</p>{data.certificate ? <Link className="font-bold text-purple-700" to={`/certificates/${data.certificate}`}>View your certificate →</Link> : data.ready && data.exam ? <Link className="inline-block rounded-xl bg-purple-700 px-4 py-3 font-bold text-white" to={`/learn/assessments/${data.exam.id}`}>Start final exam</Link> : <p className="text-sm font-semibold text-slate-500">{!data.exam ? 'Exam not yet published' : 'Complete your units first'}</p>}</section></aside>
    <section className="min-h-[420px] rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">{unit ? <Unit key={unit.id} unit={unit} onStudied={remote.reload} /> : <div className="mx-auto max-w-lg py-14 text-center"><BookOpen size={44} className="mx-auto text-purple-600" /><h2 className="mt-5 text-2xl font-bold">Make room for your next skill</h2><p className="mt-3 leading-7 text-slate-500">{data.course.description}</p><p className="mt-5 text-sm font-semibold text-purple-700">Enroll in a module, then choose its first unit to begin.</p></div>}</section></div>
  </>}</LearningShell>;
}
