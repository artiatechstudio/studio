
"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user: any;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * مكون الأفاتار الموحد في كارينجو.
 * يتحقق برمجياً من حالة البريميوم؛ إذا انتهى الاشتراك يمنع عرض الصورة الشخصية ويظهر الأفاتار الافتراضي.
 */
export function UserAvatar({ user, className, size = "md" }: UserAvatarProps) {
  const isAdmin = user?.name === 'admin';
  const isPremium = user?.isPremium === 1 || isAdmin;
  const avatar = user?.avatar;
  
  // التحقق من تاريخ انتهاء الاشتراك برمجياً أيضاً لزيادة الأمان في الواجهة
  const now = Date.now();
  const isExpired = user?.premiumUntil && now > user.premiumUntil && !isAdmin;
  
  // لا تظهر الصورة الشخصية إلا إذا كان المستخدم بريميوم حالياً وغير منتهي
  const showImage = isPremium && !isExpired && (avatar?.startsWith('data:image') || avatar?.startsWith('http'));
  
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-xl",
    lg: "w-14 h-14 text-2xl",
    xl: "w-28 h-28 text-6xl"
  };

  return (
    <div className={cn(
      "bg-white rounded-full flex items-center justify-center border border-border shadow-sm overflow-hidden shrink-0 relative",
      sizeClasses[size],
      className
    )}>
      {showImage ? (
        <img src={avatar} alt={user?.name} className="w-full h-full object-cover" />
      ) : (
        <span className="select-none">
          {(avatar?.startsWith('data:image') || avatar?.startsWith('http')) ? "🐱" : (avatar || "🐱")}
        </span>
      )}
      {isPremium && !isExpired && size !== 'sm' && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white" />
      )}
    </div>
  );
}
