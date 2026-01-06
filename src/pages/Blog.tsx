import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const blogPosts = [
  {
    id: 1,
    title: "Top 10 Software Bundles for Developers in 2024",
    excerpt: "Discover the most valuable software bundles that every developer needs in their toolkit this year.",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
    category: "Software",
    author: "Admin",
    date: "Jan 5, 2024",
  },
  {
    id: 2,
    title: "How to Maximize Value from Digital Product Purchases",
    excerpt: "Learn strategies to get the most out of your digital product investments and save money.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    category: "Tips",
    author: "Admin",
    date: "Jan 3, 2024",
  },
  {
    id: 3,
    title: "The Rise of Digital Products: Market Trends",
    excerpt: "An analysis of the growing digital products market and what it means for consumers.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    category: "Industry",
    author: "Admin",
    date: "Dec 28, 2023",
  },
  {
    id: 4,
    title: "Security Best Practices for Digital Purchases",
    excerpt: "Essential tips to keep your digital purchases and personal information safe online.",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop",
    category: "Security",
    author: "Admin",
    date: "Dec 20, 2023",
  },
  {
    id: 5,
    title: "Design Tools Every Creative Should Have",
    excerpt: "A curated list of must-have design tools and templates for creative professionals.",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop",
    category: "Design",
    author: "Admin",
    date: "Dec 15, 2023",
  },
  {
    id: 6,
    title: "Getting Started with Our Platform",
    excerpt: "A complete guide for new users on how to browse, purchase, and access digital products.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop",
    category: "Guide",
    author: "Admin",
    date: "Dec 10, 2023",
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our <span className="text-primary">Blog</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest news, tips, and insights about digital products.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-3">
                    {post.category}
                  </Badge>
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </span>
                    </div>
                    <span className="text-primary flex items-center gap-1 font-medium">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
