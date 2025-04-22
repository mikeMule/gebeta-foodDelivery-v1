import { createContext, useContext, useState, ReactNode } from "react";

interface UserData {
  id?: number;
  username?: string;
  phoneNumber: string;
  location?: string;
  fullName?: string;
  email?: string;
  idNumber?: string;
  idVerified?: boolean;
  userType?: string; // customer, restaurant_owner, delivery_partner, admin
  profileImage?: string;
  // Restaurant owner specific fields
  restaurantId?: number;
  restaurantName?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userData: UserData | null;
  login: (data: UserData) => void;
  verifyOtp: (otp: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserData>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Use localStorage to persist authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('isAuthenticated');
    return saved === 'true';
  });
  
  const [userData, setUserData] = useState<UserData | null>(() => {
    const saved = localStorage.getItem('userData');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (data: UserData) => {
    setUserData(data);
    setIsAuthenticated(true);
    localStorage.setItem('userData', JSON.stringify(data));
    localStorage.setItem('isAuthenticated', 'true');
  };

  const verifyOtp = (otp: string) => {
    // In a real app, you would verify the OTP with your backend
    // For now, we'll just set the user as authenticated
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    
    // Mock setting a default location if none is provided
    if (userData && !userData.location) {
      const updatedUserData = { ...userData, location: "Bole, Addis Ababa" };
      setUserData(updatedUserData);
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
    }
  };

  const logout = () => {
    // Only log out if the user explicitly requested it
    setIsAuthenticated(false);
    setUserData(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userData');
  };
  
  const updateProfile = (data: Partial<UserData>) => {
    if (userData) {
      const updatedUserData = { ...userData, ...data };
      setUserData(updatedUserData);
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userData,
        login,
        verifyOtp,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
