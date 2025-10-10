import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FreelancerCard from "@/components/FreelancerCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

// Mock data
const categories = [
  "All Categories",
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Graphic Design",
  "Content Writing",
  "Digital Marketing",
  "Video Editing",
  "Data Science",
];

const mockFreelancers = [
  {
    id: "1",
    name: "Sarah Johnson",
    title: "Full Stack Developer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 85,
    location: "San Francisco, CA",
    skills: ["React", "Node.js", "TypeScript", "AWS"],
    category: "Web Development",
  },
  {
    id: "2",
    name: "Michael Chen",
    title: "UI/UX Designer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    rating: 4.8,
    reviewCount: 94,
    hourlyRate: 70,
    location: "New York, NY",
    skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
    category: "UI/UX Design",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    title: "Mobile App Developer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    rating: 5.0,
    reviewCount: 156,
    hourlyRate: 95,
    location: "Austin, TX",
    skills: ["React Native", "Flutter", "iOS", "Android"],
    category: "Mobile Development",
  },
  {
    id: "4",
    name: "David Kumar",
    title: "Content Writer & SEO Specialist",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    rating: 4.7,
    reviewCount: 83,
    hourlyRate: 45,
    location: "London, UK",
    skills: ["SEO", "Copywriting", "Content Strategy", "WordPress"],
    category: "Content Writing",
  },
  {
    id: "5",
    name: "Jessica Williams",
    title: "Graphic Designer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
    rating: 4.9,
    reviewCount: 112,
    hourlyRate: 60,
    location: "Los Angeles, CA",
    skills: ["Illustrator", "Photoshop", "Branding", "Print Design"],
    category: "Graphic Design",
  },
  {
    id: "6",
    name: "Alex Thompson",
    title: "Digital Marketing Expert",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    rating: 4.8,
    reviewCount: 98,
    hourlyRate: 75,
    location: "Chicago, IL",
    skills: ["Google Ads", "Facebook Ads", "Analytics", "Email Marketing"],
    category: "Digital Marketing",
  },
  {
    id: "7",
    name: "Priya Patel",
    title: "Data Scientist",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    rating: 5.0,
    reviewCount: 67,
    hourlyRate: 110,
    location: "Seattle, WA",
    skills: ["Python", "Machine Learning", "TensorFlow", "Data Visualization"],
    category: "Data Science",
  },
  {
    id: "8",
    name: "James Anderson",
    title: "Video Editor & Animator",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    rating: 4.9,
    reviewCount: 89,
    hourlyRate: 65,
    location: "Miami, FL",
    skills: ["After Effects", "Premiere Pro", "Motion Graphics", "Color Grading"],
    category: "Video Editing",
  },
];

const Freelancers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedRating, setSelectedRating] = useState("All Ratings");

  const filteredFreelancers = mockFreelancers.filter((freelancer) => {
    const matchesSearch =
      freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All Categories" || freelancer.category === selectedCategory;

    const matchesRating =
      selectedRating === "All Ratings" ||
      (selectedRating === "4.5+" && freelancer.rating >= 4.5) ||
      (selectedRating === "4.0+" && freelancer.rating >= 4.0);

    return matchesSearch && matchesCategory && matchesRating;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 gradient-hero">
        <div className="container mx-auto px-4 md:px-6 lg:px-12 py-10">
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Top Freelancers
            </h1>
            <p className="text-muted-foreground text-lg">
              Connect with talented professionals ready to bring your projects to life
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-background/60 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-card mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, title, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger className="w-full md:w-[160px]">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Ratings">All Ratings</SelectItem>
                  <SelectItem value="4.5+">4.5+ Stars</SelectItem>
                  <SelectItem value="4.0+">4.0+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredFreelancers.length}</span> freelancers
            </p>
          </div>

          {/* Freelancers Grid */}
          {filteredFreelancers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
              {filteredFreelancers.map((freelancer) => (
                <FreelancerCard key={freelancer.id} {...freelancer} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No freelancers found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Freelancers;
