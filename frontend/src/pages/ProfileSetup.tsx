import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Briefcase,
  User,
  Building2,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts";
import authService from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

interface FreelancerSetupData {
  title: string;
  category: string;
  rate: string;
  skills: string;
  bio: string;
  location: string;
}

interface ClientSetupData {
  company_name: string;
}

const ProfileSetup = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);

  // Freelancer form data
  const [freelancerData, setFreelancerData] = useState<FreelancerSetupData>({
    title: "",
    category: "",
    rate: "",
    skills: "",
    bio: "",
    location: "",
  });

  // Client form data
  const [clientData, setClientData] = useState<ClientSetupData>({
    company_name: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated || !user) {
      navigate("/login", { replace: true });
      return;
    }

    // If user is admin, redirect to dashboard
    if (user.role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }
  }, [isAuthenticated, user, navigate]);

  const handleFreelancerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFreelancerData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateFreelancerForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!freelancerData.title.trim()) {
      newErrors.title = "Professional title is required";
    }

    if (!freelancerData.category.trim()) {
      newErrors.category = "Category is required";
    }

    if (freelancerData.rate && isNaN(Number(freelancerData.rate))) {
      newErrors.rate = "Rate must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateClientForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!clientData.company_name.trim()) {
      newErrors.company_name = "Company name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validate based on user role
    const isValid =
      user.role === "freelancer"
        ? validateFreelancerForm()
        : validateClientForm();

    if (!isValid) return;

    try {
      setIsLoading(true);

      // Prepare data based on user role
      const profileData =
        user.role === "freelancer"
          ? {
              ...freelancerData,
              // Convert empty strings to null for optional fields
              rate: freelancerData.rate ? freelancerData.rate : null,
              skills: freelancerData.skills || null,
              bio: freelancerData.bio || null,
              location: freelancerData.location || null,
            }
          : {
              ...clientData,
            };

      await authService.createRoleProfile(profileData);

      setIsComplete(true);

      toast({
        title: "Profile Setup Complete!",
        description: `Your ${user.role} profile has been created successfully.`,
      });

      // Redirect after a short delay to show success state
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description:
          error.message || "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Create profile with minimal data (nulls for optional fields)
    const minimalData =
      user?.role === "freelancer"
        ? { title: "Professional", category: "General" }
        : { company_name: "Individual" };

    authService
      .createRoleProfile(minimalData)
      .then(() => {
        toast({
          title: "Profile Created",
          description:
            "You can complete your profile later from the Profile page.",
        });
        navigate("/", { replace: true });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create profile.",
          variant: "destructive",
        });
      });
  };

  if (!user) {
    return null;
  }

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero px-4">
        <Card className="w-full max-w-md text-center shadow-card-hover">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Setup Complete!
            </h2>
            <p className="text-gray-600 mb-4">
              Your {user.role} profile has been created successfully.
            </p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero px-4 py-8">
      <Card className="w-full max-w-2xl shadow-card-hover">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 font-bold text-2xl text-primary mb-4">
            <Briefcase className="h-7 w-7" />
            FreelanceHub
          </div>
          <CardTitle className="text-2xl">
            Complete Your Profile Setup
          </CardTitle>
          <CardDescription>
            Welcome, {user.first_name}! Let's set up your {user.role} profile to
            get started.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {user.role === "freelancer" ? (
              <>
                {/* Freelancer Form Fields */}
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Freelancer Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Professional Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Full Stack Developer"
                      value={freelancerData.title}
                      onChange={handleFreelancerChange}
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      name="category"
                      placeholder="e.g., Web Development"
                      value={freelancerData.category}
                      onChange={handleFreelancerChange}
                      className={errors.category ? "border-red-500" : ""}
                    />
                    {errors.category && (
                      <p className="text-sm text-red-500">{errors.category}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate">Hourly Rate (optional)</Label>
                    <Input
                      id="rate"
                      name="rate"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 25.00"
                      value={freelancerData.rate}
                      onChange={handleFreelancerChange}
                      className={errors.rate ? "border-red-500" : ""}
                    />
                    {errors.rate && (
                      <p className="text-sm text-red-500">{errors.rate}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location (optional)</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="e.g., New York, USA"
                      value={freelancerData.location}
                      onChange={handleFreelancerChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (optional)</Label>
                  <Input
                    id="skills"
                    name="skills"
                    placeholder="e.g., React, Node.js, Python"
                    value={freelancerData.skills}
                    onChange={handleFreelancerChange}
                  />
                  <p className="text-sm text-gray-500">
                    Separate skills with commas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (optional)</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell us about yourself and your experience..."
                    rows={4}
                    value={freelancerData.bio}
                    onChange={handleFreelancerChange}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Client Form Fields */}
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Company Information</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    placeholder="e.g., Acme Corporation"
                    value={clientData.company_name}
                    onChange={handleClientChange}
                    className={errors.company_name ? "border-red-500" : ""}
                  />
                  {errors.company_name && (
                    <p className="text-sm text-red-500">
                      {errors.company_name}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Creating Profile..."
                ) : (
                  <>
                    Complete Setup
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                Skip for Now
              </Button>
            </div>

            <p className="text-sm text-gray-500 text-center">
              You can always update your profile information later from your
              profile page.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;
