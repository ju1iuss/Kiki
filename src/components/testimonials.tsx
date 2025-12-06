import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

type Testimonial = {
    name: string
    role: string
    image: string
    quote: string
}

const testimonials: Testimonial[] = [
    {
        name: 'Darius Göttert',
        role: 'Founder',
        image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=200&h=200&fit=crop&q=80',
        quote: 'Finally can test as many ad variants as we want without booking creators every time. Doubled our campaign performance.',
    },
    {
        name: 'Luis Reutner',
        role: 'Content Creator',
        image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&h=200&fit=crop&q=80',
        quote: 'No more endless back-and-forth with video teams. We have full control and can react instantly.',
    },
    {
        name: 'Daniel Von Maydell',
        role: 'Social Media Agency',
        image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=200&h=200&fit=crop&q=80',
        quote: 'Our TikTok ads perform better than videos we used to pay €800 for. Wild.',
    },
    {
        name: 'Eric Jansen',
        role: 'Co-founder Social Media Agency',
        image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&h=200&fit=crop&q=80',
        quote: 'As an online shop, we can now promote every new product with video content immediately. No more waiting.',
    },
    {
        name: 'Lorenz Kopp',
        role: 'Founder Recruiting Agency',
        image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=200&h=200&fit=crop&q=80',
        quote: 'Game changer for scaling. Managing multiple accounts at once now.',
    },
    {
        name: 'Tim Heissler',
        role: 'Head of E-Commerce',
        image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&h=200&fit=crop&q=80',
        quote: 'Automation completely changed our content process. We can focus on what actually matters.',
    },
]

const chunkArray = (array: Testimonial[], chunkSize: number): Testimonial[][] => {
    const result: Testimonial[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize))
    }
    return result
}

const testimonialChunks = chunkArray(testimonials, Math.ceil(testimonials.length / 3))

export default function Testimonials() {
    return (
        <section>
            <div className="py-16 md:py-32">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-semibold">Trusted by Founders</h2>
                        <p className="mt-6">Real founders hitting millions of views with automated account management.</p>
                    </div>
                    <div className="mt-8 grid gap-3 sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
                        {testimonialChunks.map((chunk, chunkIndex) => (
                            <div
                                key={chunkIndex}
                                className="space-y-3">
                                {chunk.map(({ name, role, quote, image }, index) => (
                                    <Card key={index} className="rounded-none">
                                        <CardContent className="grid grid-cols-[auto_1fr] gap-3 pt-6">
                                            <Avatar className="size-9">
                                                <AvatarImage
                                                    alt={name}
                                                    src={image}
                                                    loading="lazy"
                                                    width="120"
                                                    height="120"
                                                />
                                                <AvatarFallback>{name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                                            </Avatar>

                                            <div>
                                                <h3 className="font-medium">{name}</h3>

                                                <span className="text-muted-foreground block text-sm tracking-wide">{role}</span>

                                                <blockquote className="mt-3">
                                                    <p className="text-gray-700 dark:text-gray-300">{quote}</p>
                                                </blockquote>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
