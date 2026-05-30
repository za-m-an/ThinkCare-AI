"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Users,
  Search,
  FileText,
  Loader2,
  Calendar,
  Heart,
  Activity,
  AlertCircle,
  FileDown,
  User as UserIcon,
  X
} from "lucide-react";

interface OnboardingData {
  firstName: string;
  lastName: string;
  dob: string;
  sexAtBirth: string;
  bloodType: string | null;
  height: number;
  weight: number;
  heartRate: number | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  spO2: number | null;
  avgSleepHours: number;
  fastFoodMealsPerWeek: number;
  waterCupsPerDay: number;
  dailySteps: number;
  stressLevel: number;
  smokingPacksPerWeek: number;
  alcoholDrinksPerWeek: number;
  conditions: string[];
  medications: string | null;
  allergies: string | null;
}

interface UserData {
  id: number;
  email: string;
  fullName: string;
  role: string;
  patientId: string | null;
  isOnboarded: boolean;
  createdAt: string;
  onboarding: OnboardingData | null;
}

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (err) {
        console.error("Failed to load users", err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.patientId && u.patientId.toLowerCase().includes(q))
    );
  });

  const getAge = (dobString: string) => {
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDownloadReport = (user: UserData) => {
    if (!user.onboarding) return;
    const ob = user.onboarding;

    const reportContent = `============================================================
THINKCARE AI CLINICAL REPORT - CONFIDENTIAL
============================================================
Patient Name      : ${user.fullName}
Patient ID        : ${user.patientId || "N/A"}
Email Address     : ${user.email}
Account Role      : ${user.role}
Account Created   : ${new Date(user.createdAt).toLocaleDateString()}
Onboarded Status  : ${user.isOnboarded ? "COMPLETED" : "INCOMPLETE"}

------------------------------------------------------------
BIOMETRIC & DEMOGRAPHIC METRICS
------------------------------------------------------------
Date of Birth     : ${new Date(ob.dob).toLocaleDateString()} (Age: ${getAge(ob.dob)})
Sex at Birth      : ${ob.sexAtBirth}
Blood Type        : ${ob.bloodType || "Not recorded"}
Height            : ${ob.height} cm
Weight            : ${ob.weight} kg
BMI               : ${((ob.weight / (ob.height / 100) ** 2)).toFixed(1)}

------------------------------------------------------------
VITAL SIGNS (LATEST PROFILE)
------------------------------------------------------------
Heart Rate        : ${ob.heartRate ? `${ob.heartRate} BPM` : "Not recorded"}
Blood Pressure    : ${ob.bloodPressureSystolic && ob.bloodPressureDiastolic ? `${ob.bloodPressureSystolic}/${ob.bloodPressureDiastolic} mmHg` : "Not recorded"}
SpO2 Level        : ${ob.spO2 ? `${ob.spO2}%` : "Not recorded"}

------------------------------------------------------------
LIFESTYLE RISK TRACKERS
------------------------------------------------------------
Avg Sleep Hours   : ${ob.avgSleepHours} hrs/night
Water Intake      : ${ob.waterCupsPerDay} cups/day
Daily Steps       : ${ob.dailySteps} steps/day
Stress Level      : ${ob.stressLevel}/10
Fast Food Meals   : ${ob.fastFoodMealsPerWeek} meals/week
Smoking Habits    : ${ob.smokingPacksPerWeek} packs/week
Alcohol Intake    : ${ob.alcoholDrinksPerWeek} drinks/week

------------------------------------------------------------
MEDICAL HISTORIES & CONDITIONS
------------------------------------------------------------
Diagnosed Conditions: ${ob.conditions.length > 0 ? ob.conditions.join(", ") : "None declared"}
Medications         : ${ob.medications ? ob.medications.replace(/\n/g, ", ") : "None declared"}
Allergies           : ${ob.allergies ? ob.allergies.replace(/\n/g, ", ") : "None declared"}

============================================================
REPORT GENERATED ON : ${new Date().toLocaleString()}
ThinkCare AI Clinical Analytics System - Secure Portal
============================================================`;

    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ThinkCare_Report_${user.patientId || user.fullName.replace(/\s+/g, "_")}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c101b] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0c101b] text-white font-sans">
      <Sidebar activeTab="users" userRole="ADMIN" />

      <div className="flex-1 flex flex-col md:flex-row h-screen">
        {/* Users list section */}
        <div className="flex-1 flex flex-col h-full border-r border-[#1e293b]/50 overflow-y-auto">
          <header className="border-b border-[#1e293b]/50 px-8 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100">Monitor Users</h1>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold tracking-wide">
                Patient Profiles & Demographic Records
              </p>
            </div>
            <div className="relative w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Search className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                className="w-full rounded-xl border border-[#2e3e56] bg-[#131824] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none"
                placeholder="Search name, email, patient ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </header>

          <div className="p-8">
            <div className="bg-[#131824] rounded-2xl border border-[#1e293b] shadow-xl overflow-hidden">
              <div className="p-5 border-b border-[#1e293b]/50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Users className="h-4.5 w-4.5 text-blue-400" />
                  All Registered Users ({filteredUsers.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] font-medium text-slate-300">
                  <thead className="bg-slate-950/20 text-slate-500 border-b border-[#1e293b]/50 text-[9px] uppercase tracking-widest">
                    <tr>
                      <th className="py-4 px-6">Patient ID</th>
                      <th className="py-4 px-6">Full Name</th>
                      <th className="py-4 px-6">Email</th>
                      <th className="py-4 px-6">Onboarding</th>
                      <th className="py-4 px-6">Signup Date</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b]/40">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 font-semibold">
                          No users found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className={`hover:bg-slate-900/10 cursor-pointer transition-colors ${
                            selectedUser?.id === user.id ? "bg-slate-900/20" : ""
                          }`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <td className="py-4 px-6 font-mono text-slate-400">
                            {user.patientId || "TC-PENDING"}
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-200">
                            {user.fullName}
                          </td>
                          <td className="py-4 px-6 text-slate-400">{user.email}</td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                                user.isOnboarded
                                  ? "bg-green-500/10 text-green-400 border-green-500/10"
                                  : "bg-yellow-500/10 text-yellow-500 border-yellow-500/10"
                              }`}
                            >
                              {user.isOnboarded ? "COMPLETED" : "PENDING"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                            {user.isOnboarded ? (
                              <button
                                onClick={() => handleDownloadReport(user)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/15 hover:bg-blue-600 hover:text-white transition-all text-[10px] font-semibold text-blue-400 cursor-pointer"
                              >
                                <FileDown className="h-3.5 w-3.5" />
                                Report
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-600 italic">No Onboarding</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* User Confidential details panel */}
        <div className="w-full md:w-96 bg-[#131824] p-6 flex flex-col h-full overflow-y-auto shrink-0 border-l border-[#1e293b]/50">
          {selectedUser ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-[#1e293b]/50 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <UserIcon className="h-4.5 w-4.5 text-blue-400" />
                    Patient File Detail
                  </h3>
                  <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                    {selectedUser.patientId || "PENDING INTEGRATION"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-200 transition-colors"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* General details */}
              <div className="space-y-3 p-4 rounded-xl bg-[#0c101b] border border-[#1e293b]">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Name</span>
                  <span className="font-semibold text-slate-200">{selectedUser.fullName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Email</span>
                  <span className="font-semibold text-slate-200">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Account Type</span>
                  <span className="font-semibold text-blue-400 uppercase tracking-widest text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10">
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              {/* Onboarding Clinical data */}
              {selectedUser.onboarding ? (
                <div className="space-y-6">
                  {/* Health metrics */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Onboarding Medical File
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-[#0c101b] border border-[#1e293b]/70 rounded-xl">
                        <span className="text-[9px] text-slate-500 uppercase block font-semibold">Age / Sex</span>
                        <span className="text-slate-200 font-bold block mt-1">
                          {getAge(selectedUser.onboarding.dob)} yrs / {selectedUser.onboarding.sexAtBirth}
                        </span>
                      </div>
                      <div className="p-3 bg-[#0c101b] border border-[#1e293b]/70 rounded-xl">
                        <span className="text-[9px] text-slate-500 uppercase block font-semibold">Blood Group</span>
                        <span className="text-slate-200 font-bold block mt-1">
                          {selectedUser.onboarding.bloodType || "N/A"}
                        </span>
                      </div>
                      <div className="p-3 bg-[#0c101b] border border-[#1e293b]/70 rounded-xl">
                        <span className="text-[9px] text-slate-500 uppercase block font-semibold">Height</span>
                        <span className="text-slate-200 font-bold block mt-1">
                          {selectedUser.onboarding.height} cm
                        </span>
                      </div>
                      <div className="p-3 bg-[#0c101b] border border-[#1e293b]/70 rounded-xl">
                        <span className="text-[9px] text-slate-500 uppercase block font-semibold">Weight</span>
                        <span className="text-slate-200 font-bold block mt-1">
                          {selectedUser.onboarding.weight} kg
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vitals metrics */}
                  <div className="space-y-4 pt-4 border-t border-[#1e293b]/40">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Recent Biometrics
                    </h4>
                    <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                      <div className="p-2.5 bg-[#0c101b]/50 border border-[#1e293b]/60 rounded-xl">
                        <Heart className="h-4 w-4 text-[#f87171] mx-auto mb-1" />
                        <span className="text-[8px] text-slate-500 block font-semibold uppercase">Heart Rate</span>
                        <span className="text-slate-200 font-bold block mt-0.5">
                          {selectedUser.onboarding.heartRate ? `${selectedUser.onboarding.heartRate}` : "--"}
                        </span>
                      </div>
                      <div className="p-2.5 bg-[#0c101b]/50 border border-[#1e293b]/60 rounded-xl">
                        <Activity className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                        <span className="text-[8px] text-slate-500 block font-semibold uppercase">Blood Press.</span>
                        <span className="text-slate-200 font-bold block mt-0.5">
                          {selectedUser.onboarding.bloodPressureSystolic
                            ? `${selectedUser.onboarding.bloodPressureSystolic}/${selectedUser.onboarding.bloodPressureDiastolic}`
                            : "--"}
                        </span>
                      </div>
                      <div className="p-2.5 bg-[#0c101b]/50 border border-[#1e293b]/60 rounded-xl">
                        <span className="text-[10px] font-bold text-emerald-400 block mb-1">O₂</span>
                        <span className="text-[8px] text-slate-500 block font-semibold uppercase">SpO₂</span>
                        <span className="text-slate-200 font-bold block mt-0.5">
                          {selectedUser.onboarding.spO2 ? `${selectedUser.onboarding.spO2}%` : "--"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Medical Backgrounds */}
                  <div className="space-y-4 pt-4 border-t border-[#1e293b]/40">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Medical Profile Details
                    </h4>
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-slate-500 block">Diagnosed Conditions</span>
                        <span className="font-semibold text-slate-200 block mt-1">
                          {selectedUser.onboarding.conditions.join(", ") || "No diagnosed conditions declared."}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Medications</span>
                        <span className="font-semibold text-slate-200 block mt-1 whitespace-pre-line">
                          {selectedUser.onboarding.medications || "None declared."}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Allergies</span>
                        <span className="font-semibold text-red-400/90 block mt-1 whitespace-pre-line">
                          {selectedUser.onboarding.allergies || "None declared."}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadReport(selectedUser)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 shadow-md shadow-blue-500/10 transition-colors mt-6 cursor-pointer"
                  >
                    <FileText className="h-4.5 w-4.5" />
                    Download Health Report
                  </button>
                </div>
              ) : (
                <div className="py-12 text-center bg-[#0c101b] border border-[#1e293b] rounded-2xl">
                  <AlertCircle className="h-8 w-8 text-yellow-500/80 mx-auto mb-3" />
                  <p className="text-xs text-slate-400 font-semibold px-4 leading-normal">
                    This user has not completed their health profile onboarding yet. Confidential report unavailable.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Users className="h-10 w-10 text-slate-600 mb-3 animate-pulse" />
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Patient Profile</h4>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] leading-relaxed">
                Click on any user in the table list to inspect their clinical file and generate records.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
