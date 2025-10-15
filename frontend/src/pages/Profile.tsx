import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  User,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Building,
  Phone,
  Mail,
  Edit3,
  Save,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts";
import {
  ProfileUpdateRequest,
  FreelancerProfile,
  ClientProfile,
  FreelancerCreateRequest,
  ClientCreateRequest,
} from "@/types/auth";
import authService from "@/services/authService";

const Profile = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [roleProfile, setRoleProfile] = useState<
    FreelancerProfile | ClientProfile | null
  >(null);
  const [hasRoleProfile, setHasRoleProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Form states
  const [userFormData, setUserFormData] = useState<ProfileUpdateRequest>({
    first_name: "",
    last_name: "",
    phone: "",
    bio: "",
    profile_picture: "",
  });

  const [freelancerFormData, setFreelancerFormData] =
    useState<FreelancerCreateRequest>({
      title: "",
      category: "",
      rate: "",
      skills: "",
      bio: "",
      location: "",
    });

  const [clientFormData, setClientFormData] = useState<ClientCreateRequest>({
    company_name: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Categories for freelancers
  const freelancerCategories = [
    "Web Development",
    "Mobile Development",
    "UI/UX Design",
    "Graphic Design",
    "Content Writing",
    "Digital Marketing",
    "Data Science",
    "DevOps",
    "Consulting",
    "Other",
  ];

  useEffect(() => {
    if (user) {
      // Initialize user form data
      setUserFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        bio: user.bio || "",
        profile_picture: user.profile_picture || "",
      });

      // Fetch complete profile including role-specific data
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setProfileLoading(true);

      // Fetch complete profile data using the combined profile endpoint
      const profileData = await authService.getProfile();

      // Update user form data with user profile data
      setUserFormData({
        first_name: profileData.user.first_name || "",
        last_name: profileData.user.last_name || "",
        phone: profileData.user.phone || "",
        bio: profileData.user.bio || "",
        profile_picture: profileData.user.profile_picture || "",
      });

      // Handle role-specific profile data
      setHasRoleProfile(profileData.has_role_profile || false);
      setRoleProfile(profileData.role_profile);

      if (profileData.role_profile) {
        // Populate form data based on user role
        if (user?.role === "freelancer") {
          setFreelancerFormData({
            title: profileData.role_profile.title || "",
            category: profileData.role_profile.category || "",
            rate: profileData.role_profile.rate
              ? profileData.role_profile.rate.toString()
              : "",
            skills: profileData.role_profile.skills || "",
            bio: profileData.role_profile.bio || "",
            location: profileData.role_profile.location || "",
          });
        } else if (user?.role === "client") {
          setClientFormData({
            company_name: profileData.role_profile.company_name || "",
          });
        }
      } else {
        // Clear role profile form data if no profile exists
        if (user?.role === "freelancer") {
          setFreelancerFormData({
            title: "",
            category: "",
            rate: "",
            skills: "",
            bio: "",
            location: "",
          });
        } else if (user?.role === "client") {
          setClientFormData({
            company_name: "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      setErrorMessage("Failed to load profile data");
    } finally {
      setProfileLoading(false);
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.first_name.charAt(0)}${user.last_name.charAt(
      0
    )}`.toUpperCase();
  };

  const handleUserFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUserFormData((prev) => ({
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

  const handleFreelancerFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFreelancerFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleClientFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateUserForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!userFormData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!userFormData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (userFormData.phone && !/^\+?[\d\s\-()]+$/.test(userFormData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRoleForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (user?.role === "freelancer") {
      if (!freelancerFormData.title?.trim()) {
        newErrors.title = "Professional title is required";
      }
      if (!freelancerFormData.category?.trim()) {
        newErrors.category = "Category is required";
      }
      if (
        freelancerFormData.rate &&
        !/^\d+(\.\d{2})?$/.test(freelancerFormData.rate)
      ) {
        newErrors.rate = "Please enter a valid rate (e.g., 25.00)";
      }
    } else if (user?.role === "client") {
      if (!clientFormData.company_name?.trim()) {
        newErrors.company_name = "Company name is required";
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    setSuccessMessage("");
    setErrorMessage("");

    if (!validateUserForm()) {
      return;
    }

    try {
      // Prepare combined data for the unified endpoint
      let combinedData = { ...userFormData };

      // Add role-specific data if needed
      if (!hasRoleProfile || validateRoleForm()) {
        if (user?.role === "freelancer") {
          combinedData = { ...combinedData, ...freelancerFormData };
        } else if (user?.role === "client") {
          combinedData = { ...combinedData, ...clientFormData };
        }
      }

      // Update profile using the combined endpoint
      const updatedProfile = await authService.updateProfile(combinedData);

      // Update local state with the response
      setHasRoleProfile(updatedProfile.has_role_profile || false);
      setRoleProfile(updatedProfile.role_profile);

      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);

      // Refresh profile data to ensure consistency
      await fetchProfileData();
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    // Reset form data
    if (user) {
      setUserFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        bio: user.bio || "",
        profile_picture: user.profile_picture || "",
      });
    }

    setErrors({});
    setIsEditing(false);
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Please log in to view your profile
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Manage your account information, professional details, and
                preferences to enhance your freelance marketplace experience
              </p>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {/* Main Profile Card */}
            <Card className="shadow-lg border-0">
              <CardHeader className="relative pb-6">
                {/* Edit Button - Top Right */}
                <div className="absolute top-4 right-4 z-10">
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="shadow-sm"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                        className="shadow-sm"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        className="shadow-sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                {/* Profile Header - Centered */}
                <div className="flex flex-col items-center text-center space-y-4 pt-4">
                  <Avatar className="h-32 w-32 shadow-lg ring-4 ring-background">
                    <AvatarImage
                      src={user.profile_picture}
                      alt={`${user.first_name} ${user.last_name}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-bold text-gray-900">
                      {user.first_name} {user.last_name}
                    </CardTitle>
                    <CardDescription className="flex items-center justify-center gap-3 text-base">
                      <Badge
                        variant="secondary"
                        className="capitalize px-3 py-1"
                      >
                        {user.role}
                      </Badge>
                      <span className="text-muted-foreground">
                        @{user.username}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-8 px-6 pb-6">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Basic Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="first_name"
                        className="text-sm font-medium text-gray-700"
                      >
                        First Name *
                      </Label>
                      {isEditing ? (
                        <Input
                          id="first_name"
                          name="first_name"
                          value={userFormData.first_name}
                          onChange={handleUserFormChange}
                          className={`transition-all ${
                            errors.first_name
                              ? "border-red-500 focus:border-red-500"
                              : "focus:border-blue-500"
                          }`}
                          placeholder="Enter your first name"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-sm font-medium">
                            {user.first_name}
                          </p>
                        </div>
                      )}
                      {errors.first_name && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.first_name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="last_name"
                        className="text-sm font-medium text-gray-700"
                      >
                        Last Name *
                      </Label>
                      {isEditing ? (
                        <Input
                          id="last_name"
                          name="last_name"
                          value={userFormData.last_name}
                          onChange={handleUserFormChange}
                          className={`transition-all ${
                            errors.last_name
                              ? "border-red-500 focus:border-red-500"
                              : "focus:border-blue-500"
                          }`}
                          placeholder="Enter your last name"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-sm font-medium">
                            {user.last_name}
                          </p>
                        </div>
                      )}
                      {errors.last_name && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.last_name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        Email Address
                      </Label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <p className="text-sm font-medium">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Email cannot be changed
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4 text-gray-500" />
                        Phone Number
                      </Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          name="phone"
                          value={userFormData.phone}
                          onChange={handleUserFormChange}
                          placeholder="Enter your phone number"
                          className={`transition-all ${
                            errors.phone
                              ? "border-red-500 focus:border-red-500"
                              : "focus:border-blue-500"
                          }`}
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-sm font-medium">
                            {user.phone || "Not provided"}
                          </p>
                        </div>
                      )}
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="bio"
                      className="text-sm font-medium text-gray-700"
                    >
                      Bio
                    </Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        name="bio"
                        value={userFormData.bio}
                        onChange={handleUserFormChange}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className="transition-all focus:border-blue-500 resize-none"
                      />
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg border min-h-[100px]">
                        <p className="text-sm leading-relaxed">
                          {user.bio || "No bio provided"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Role-specific Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      {user.role === "freelancer" ? (
                        <Briefcase className="h-5 w-5 text-purple-600" />
                      ) : (
                        <Building className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {user.role === "freelancer"
                        ? "Professional Details"
                        : "Company Details"}
                    </h3>
                    {profileLoading && (
                      <div className="flex items-center gap-2 ml-auto">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-gray-500">
                          Loading...
                        </span>
                      </div>
                    )}
                  </div>

                  {user.role === "freelancer" && (
                    <div className="space-y-6">
                      {!hasRoleProfile && isEditing && (
                        <Alert className="border-blue-200 bg-blue-50">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">
                            Complete your freelancer profile to start receiving
                            job opportunities and showcase your expertise.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="title"
                            className="text-sm font-medium text-gray-700"
                          >
                            Professional Title *
                          </Label>
                          {isEditing ? (
                            <Input
                              id="title"
                              name="title"
                              value={freelancerFormData.title}
                              onChange={handleFreelancerFormChange}
                              placeholder="e.g., Full-stack Developer"
                              className={`transition-all ${
                                errors.title
                                  ? "border-red-500 focus:border-red-500"
                                  : "focus:border-blue-500"
                              }`}
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-lg border">
                              <p className="text-sm font-medium">
                                {(roleProfile as FreelancerProfile)?.title ||
                                  "Not provided"}
                              </p>
                            </div>
                          )}
                          {errors.title && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.title}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="category"
                            className="text-sm font-medium text-gray-700"
                          >
                            Category *
                          </Label>
                          {isEditing ? (
                            <Select
                              value={freelancerFormData.category}
                              onValueChange={(value) => {
                                setFreelancerFormData((prev) => ({
                                  ...prev,
                                  category: value,
                                }));
                                if (errors.category) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    category: "",
                                  }));
                                }
                              }}
                            >
                              <SelectTrigger
                                className={`transition-all ${
                                  errors.category
                                    ? "border-red-500 focus:border-red-500"
                                    : "focus:border-blue-500"
                                }`}
                              >
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                {freelancerCategories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-lg border">
                              <p className="text-sm font-medium">
                                {(roleProfile as FreelancerProfile)?.category ||
                                  "Not provided"}
                              </p>
                            </div>
                          )}
                          {errors.category && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.category}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="rate"
                            className="text-sm font-medium text-gray-700 flex items-center gap-2"
                          >
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            Hourly Rate (₹)
                          </Label>
                          {isEditing ? (
                            <Input
                              id="rate"
                              name="rate"
                              value={freelancerFormData.rate}
                              onChange={handleFreelancerFormChange}
                              placeholder="e.g., 2500.00"
                              className={`transition-all ${
                                errors.rate
                                  ? "border-red-500 focus:border-red-500"
                                  : "focus:border-blue-500"
                              }`}
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-lg border">
                              <p className="text-sm font-medium">
                                {(roleProfile as FreelancerProfile)?.rate
                                  ? `₹${
                                      (roleProfile as FreelancerProfile).rate
                                    }/hour`
                                  : "Not provided"}
                              </p>
                            </div>
                          )}
                          {errors.rate && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.rate}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="location"
                            className="text-sm font-medium text-gray-700 flex items-center gap-2"
                          >
                            <MapPin className="h-4 w-4 text-gray-500" />
                            Location
                          </Label>
                          {isEditing ? (
                            <Input
                              id="location"
                              name="location"
                              value={freelancerFormData.location}
                              onChange={handleFreelancerFormChange}
                              placeholder="e.g., Mumbai, India"
                              className="transition-all focus:border-blue-500"
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-lg border">
                              <p className="text-sm font-medium">
                                {(roleProfile as FreelancerProfile)?.location ||
                                  "Not provided"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="skills"
                          className="text-sm font-medium text-gray-700"
                        >
                          Skills & Expertise
                        </Label>
                        {isEditing ? (
                          <Textarea
                            id="skills"
                            name="skills"
                            value={freelancerFormData.skills}
                            onChange={handleFreelancerFormChange}
                            placeholder="e.g., React, Node.js, Python, Django, UI/UX Design"
                            rows={3}
                            className="transition-all focus:border-blue-500 resize-none"
                          />
                        ) : (
                          <div className="p-4 bg-gray-50 rounded-lg border min-h-[80px]">
                            {(roleProfile as FreelancerProfile)?.skills ? (
                              <div className="flex flex-wrap gap-2">
                                {(roleProfile as FreelancerProfile).skills
                                  .split(",")
                                  .map((skill, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="px-3 py-1"
                                    >
                                      {skill.trim()}
                                    </Badge>
                                  ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                No skills provided
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {user.role === "client" && (
                    <div className="space-y-6">
                      {!hasRoleProfile && isEditing && (
                        <Alert className="border-blue-200 bg-blue-50">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">
                            Complete your company profile to start posting jobs
                            and finding talented freelancers.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="max-w-md space-y-2">
                        <Label
                          htmlFor="company_name"
                          className="text-sm font-medium text-gray-700 flex items-center gap-2"
                        >
                          <Building className="h-4 w-4 text-gray-500" />
                          Company Name *
                        </Label>
                        {isEditing ? (
                          <Input
                            id="company_name"
                            name="company_name"
                            value={clientFormData.company_name}
                            onChange={handleClientFormChange}
                            placeholder="e.g., Tech Solutions Pvt Ltd"
                            className={`transition-all ${
                              errors.company_name
                                ? "border-red-500 focus:border-red-500"
                                : "focus:border-blue-500"
                            }`}
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border">
                            <p className="text-sm font-medium">
                              {(roleProfile as ClientProfile)?.company_name ||
                                "Not provided"}
                            </p>
                          </div>
                        )}
                        {errors.company_name && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.company_name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Account Information */}
                <Separator className="my-8" />

                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Account Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg border space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Member Since
                      </Label>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(user.date_joined).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Last Login
                      </Label>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.last_login
                          ? new Date(user.last_login).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "Never"}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Email Verification
                      </Label>
                      <div>
                        <Badge
                          variant={
                            user.email_verified ? "default" : "secondary"
                          }
                          className={`${
                            user.email_verified
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-orange-100 text-orange-800 hover:bg-orange-200"
                          }`}
                        >
                          {user.email_verified
                            ? "✓ Verified"
                            : "⚠ Not Verified"}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Account Status
                      </Label>
                      <div>
                        <Badge
                          variant={user.is_active ? "default" : "destructive"}
                          className={`${
                            user.is_active
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          {user.is_active ? "✓ Active" : "✗ Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
