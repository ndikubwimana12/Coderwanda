import useRemote from '../Utils/useRemote';
import DataState from './DataState';
export default function PublicContent() {
  const partners = useRemote('/partners');
  const blog = useRemote('/blog');
  return <section className="mx-auto max-w-7xl space-y-10 px-6 py-12">
    <div><h2 className="mb-5 text-2xl font-bold">Our partners</h2><DataState {...partners} empty={!partners.data.length} label="partners" /><div className="flex flex-wrap gap-6">{partners.data.map(partner => <a key={partner.id} href={partner.website || undefined} target={partner.website ? '_blank' : undefined} rel="noreferrer" className="rounded-xl border border-slate-200 p-4">{partner.logo && <img loading="lazy" src={partner.logo} alt={partner.name} className="mb-2 h-16 w-32 object-contain" />}<span>{partner.name}</span></a>)}</div></div>
    <div><h2 className="mb-5 text-2xl font-bold">Latest news</h2><DataState {...blog} empty={!blog.data.length} label="posts" /><div className="grid gap-5 md:grid-cols-3">{blog.data.slice(0, 6).map(post => <article key={post.id} className="overflow-hidden rounded-xl border border-slate-200">{post.image && <img loading="lazy" src={post.image} alt={post.title} className="h-40 w-full object-cover" />}<div className="space-y-3 p-5"><h3 className="text-lg font-bold">{post.title}</h3><p className="text-sm text-slate-500">{post.author} · {post.category}</p><p>{post.excerpt}</p><details><summary className="cursor-pointer font-bold text-purple-700">Read article</summary><p className="mt-3 whitespace-pre-wrap">{post.content}</p></details></div></article>)}</div></div>
  </section>;
}
