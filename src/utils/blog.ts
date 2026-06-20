import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { format } from 'date-fns';

export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    content: string;
    readingTime: string;
    featuredImage?: string;
    category?: string;
    tags?: string[];
    author?: string;
    keyTakeaways?: string[];
    faq?: { q: string; a: string }[];
}

const blogsDirectory = path.join(process.cwd(), 'blogs-docs');

export function getBlogSlugs(): string[] {
    try {
        const fileNames = fs.readdirSync(blogsDirectory);
        return fileNames
            .filter(fileName => fileName.endsWith('.md'))
            .map(fileName => fileName.replace(/\.md$/, ''));
    } catch (error) {
        console.error('Error reading blog directory:', error);
        return [];
    }
}

export function getBlogBySlug(slug: string): BlogPost | null {
    try {
        const fullPath = path.join(blogsDirectory, `${slug}.md`);

        if (!fs.existsSync(fullPath)) {
            return null;
        }

        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        // Calculate reading time (average 200 words per minute)
        const wordCount = content.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200);

        const excerptFromContent = content.split('\n\n')[0]?.replace(/[#*`]/g, '').trim() || '';
        const excerpt =
            typeof data.excerpt === 'string' && data.excerpt.trim() ? data.excerpt.trim() : excerptFromContent;

        return {
            slug,
            title: data.title || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            date: data.date || format(new Date(), 'yyyy-MM-dd'),
            excerpt,
            content: content, // We'll process this to HTML in the component
            readingTime: `${readingTime} min read`,
            featuredImage: data.featuredImage,
            category: typeof data.category === 'string' ? data.category : undefined,
            tags: data.tags || [],
            author: data.author || 'A4 Team',
            keyTakeaways: Array.isArray(data.keyTakeaways) ? data.keyTakeaways : undefined,
            faq: Array.isArray(data.faq) ? data.faq : undefined
        } as BlogPost;
    } catch (error) {
        console.error(`Error processing blog ${slug}:`, error);
        return null;
    }
}

export function getAllBlogs(): BlogPost[] {
    const slugs = getBlogSlugs();
    const blogs = slugs
        .map(slug => {
            try {
                const fullPath = path.join(blogsDirectory, `${slug}.md`);
                if (!fs.existsSync(fullPath)) {
                    return null;
                }
                const fileContents = fs.readFileSync(fullPath, 'utf8');
                const { data, content } = matter(fileContents);

                const wordCount = content.split(/\s+/).length;
                const readingTime = Math.ceil(wordCount / 200);

                const excerptFromContent = content.split('\n\n')[0]?.replace(/[#*`]/g, '').trim() || '';
                const excerpt =
                    typeof data.excerpt === 'string' && data.excerpt.trim() ? data.excerpt.trim() : excerptFromContent;

                return {
                    slug,
                    title: data.title || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    date: data.date || format(new Date(), 'yyyy-MM-dd'),
                    excerpt,
                    content: content,
                    readingTime: `${readingTime} min read`,
                    featuredImage: data.featuredImage,
                    category: typeof data.category === 'string' ? data.category : undefined,
                    tags: data.tags || [],
                    author: data.author || 'A4 Team',
                    keyTakeaways: Array.isArray(data.keyTakeaways) ? data.keyTakeaways : undefined,
                    faq: Array.isArray(data.faq) ? data.faq : undefined
                } as BlogPost;
            } catch (error) {
                console.error(`Error processing blog ${slug}:`, error);
                return null;
            }
        })
        .filter((blog): blog is BlogPost => blog !== null)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return blogs;
}

export function getBlogsByTag(tag: string): BlogPost[] {
    const allBlogs = getAllBlogs();
    return allBlogs.filter(blog =>
        blog.tags?.some(t => t.toLowerCase() === tag.toLowerCase())
    );
}

export function getRelatedBlogs(currentSlug: string, limit: number = 3): BlogPost[] {
    const currentBlog = getBlogBySlug(currentSlug);
    if (!currentBlog) return [];

    const allBlogs = getAllBlogs();
    return allBlogs
        .filter(blog => blog.slug !== currentSlug)
        .filter(blog =>
            blog.tags?.some(tag =>
                currentBlog.tags?.includes(tag)
            )
        )
        .slice(0, limit);
}
