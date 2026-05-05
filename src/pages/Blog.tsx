import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Newspaper } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  link: string;
  published: string;
  snippet: string;
  image?: string;
  categories: string[];
}

const FEED_URL =
  "https://www.rafaelsaturno.com/feeds/posts/default?alt=json&max-results=30";

const stripHtml = (html: string) =>
  html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

const extractImage = (html: string): string | undefined => {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!match) return undefined;
  // Upgrade Blogger thumbnail to higher resolution
  return match[1].replace(/\/s\d+(-c)?\//, "/s640/").replace(/=s\d+(-c)?$/, "=s640");
};

const fetchPosts = async (): Promise<BlogPost[]> => {
  const res = await fetch(FEED_URL);
  if (!res.ok) throw new Error("Falha ao carregar artigos");
  const json = await res.json();
  const entries = json?.feed?.entry ?? [];
  return entries.map((e: any): BlogPost => {
    const html = e.content?.$t ?? e.summary?.$t ?? "";
    const link = (e.link ?? []).find((l: any) => l.rel === "alternate")?.href ?? "#";
    return {
      id: e.id?.$t ?? link,
      title: e.title?.$t ?? "Sem título",
      link,
      published: e.published?.$t ?? "",
      snippet: stripHtml(html).slice(0, 180),
      image: e.media$thumbnail?.url
        ? e.media$thumbnail.url.replace(/\/s\d+(-c)?\//, "/s640/")
        : extractImage(html),
      categories: (e.category ?? []).map((c: any) => c.term).slice(0, 3),
    };
  });
};

const Blog = () => {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: fetchPosts,
    staleTime: 1000 * 60 * 30,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-primary py-12 text-center">
          <div className="container mx-auto px-4">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <Newspaper size={16} />
              Blog RS Tech
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-3">
              Artigos de Tecnologia
            </h1>
            <p className="text-primary-foreground/70 max-w-xl mx-auto">
              Dicas, ofertas e novidades do mundo da tecnologia direto do blog do Rafael Saturno.
            </p>
          </div>
        </div>

        <AdBanner variant="leaderboard" />

        <section className="py-10 md:py-14 bg-background">
          <div className="container mx-auto px-4">
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-card border border-border rounded-xl overflow-hidden animate-pulse"
                  >
                    <div className="aspect-[16/9] bg-muted" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <p className="text-center text-destructive">
                Não foi possível carregar os artigos no momento.
              </p>
            )}

            {posts && posts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <a
                    key={post.id}
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all flex flex-col"
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-muted">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Newspaper size={40} />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      {post.categories[0] && (
                        <span className="text-xs font-bold text-secondary uppercase mb-2">
                          {post.categories[0]}
                        </span>
                      )}
                      <h2 className="font-display font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                        {post.snippet}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary mt-3">
                        Ler artigo <ExternalLink size={14} />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}

            <div className="text-center mt-10">
              <a
                href="https://www.rafaelsaturno.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-bold transition-colors"
              >
                Ver todos os artigos no blog
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </section>

        <AdBanner variant="in-article" format="fluid" />
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
