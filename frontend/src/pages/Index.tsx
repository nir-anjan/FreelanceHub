import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Search, Shield, Zap, Users, CheckCircle, Star } from "lucide-react";
import heroImage from "@/assets/hero-freelance.jpg";

const Index = () => {
  const categories = [
    { name: "Web Development", count: "1,234 jobs", icon: "💻" },
    { name: "Design & Creative", count: "856 jobs", icon: "🎨" },
    { name: "Writing & Content", count: "642 jobs", icon: "✍️" },
    { name: "Marketing", count: "534 jobs", icon: "📈" },
    { name: "Data Science", count: "421 jobs", icon: "📊" },
    { name: "Mobile Apps", count: "389 jobs", icon: "📱" },
  ];

  const features = [
    {
      icon: Search,
      title: "Find Perfect Projects",
      description: "Browse thousands of jobs and find the perfect match for your skills",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Get paid safely with our escrow system and milestone-based releases",
    },
    {
      icon: Zap,
      title: "Fast & Easy",
      description: "Create your profile in minutes and start applying to jobs immediately",
    },
    {
      icon: Users,
      title: "Top Talent",
      description: "Work with vetted clients and talented freelancers from around the world",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Web Developer",
      content: "FreelanceHub helped me land my dream projects. The platform is intuitive and the clients are professional.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "UI/UX Designer",
      content: "I've doubled my income since joining. The quality of projects and clients is outstanding!",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Content Writer",
      content: "Best freelance platform I've used. Quick payments and great support team.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="gradient-hero py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  Find the Perfect
                  <span className="text-primary"> Freelance</span> Job
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl">
                  Connect with top clients and quality projects. Build your freelance career or find the perfect expert for your needs.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="text-lg h-14 px-8">
                  <Link to="/jobs">
                    Find Jobs
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg h-14 px-8">
                  <Link to="/register">Sign Up Free</Link>
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div>
                  <p className="text-3xl font-bold">10K+</p>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                </div>
                <div className="h-12 w-px bg-border"></div>
                <div>
                  <p className="text-3xl font-bold">50K+</p>
                  <p className="text-sm text-muted-foreground">Freelancers</p>
                </div>
                <div className="h-12 w-px bg-border"></div>
                <div>
                  <p className="text-3xl font-bold">98%</p>
                  <p className="text-sm text-muted-foreground">Satisfaction</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-card-hover">
                <img
                  src={heroImage}
                  alt="Freelancers collaborating on projects"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Browse by Category</h2>
            <p className="text-xl text-muted-foreground">Find opportunities in your field</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link key={category.name} to="/jobs">
                <Card className="h-full shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-2 text-center">
                  <CardContent className="pt-6">
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Choose FreelanceHub?</h2>
            <p className="text-xl text-muted-foreground">Everything you need to succeed</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="shadow-card hover:shadow-card-hover transition-all duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Get started in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
              <p className="text-muted-foreground">Sign up and showcase your skills, experience, and portfolio</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Find & Apply</h3>
              <p className="text-muted-foreground">Browse jobs that match your skills and submit proposals</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Paid</h3>
              <p className="text-muted-foreground">Complete projects and receive secure payments directly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground">Join thousands of satisfied freelancers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="shadow-card">
                <CardHeader>
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-base">{testimonial.content}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join FreelanceHub today and take your freelance career to the next level
          </p>
          <Button size="lg" asChild className="text-lg h-14 px-8">
            <Link to="/register">
              Sign Up Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
