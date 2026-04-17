
"use client"

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useFirebase, useDatabase, useMemoFirebase } from '@/firebase';
import { ref } from 'firebase/database';

interface UserAvatarProps {
  user: any;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * مكون الأفاتار المطور والأكثر كفاءة في كارينجو.
 * يقوم بجلب الصورة بشكل مستقل عند الحاجة فقط لتقليل حمل البيانات في القوائم.
 */
export function UserAvatar({ user, className, size = "md" }: UserAvatarProps) {
  const { database } = useFirebase();
  const isAdmin = user?.name === 'admin';
  const userId = user?.id || user?.uid;
  
  // جلب الصورة من المسار المنفصل لضمان السرعة
  const avatarRef = useMemoFirebase(() => userId ? ref(database, `avatars/${userId}`) : null, [database, userId]);
  const { data: avatarData } = useDatabase(avatarRef);

  const isPremium = user?.isPremium === 1 || isAdmin;
  
  // التحقق من انتهاء البريميوم
  const now = Date.now();
  const isExpired = user?.premiumUntil && now > user.premiumUntil && !isAdmin;
  
  // نستخدم الأفاتار الموجود في بيانات المستخدم (إذا كان إيموجي) أو الصورة المحملة من المسار المنفصل
  const avatarValue = avatarData || user?.avatar || "🐱";
  const isImageAvatar = avatarValue?.startsWith('data:image') || avatarValue?.startsWith('http');
  const showImage = isPremium && !isExpired && isImageAvatar;
  
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-xl",
    lg: "w-14 h-14 text-2xl",
    xl: "w-28 h-28 text-6xl"
  };

  return (
    <div className={cn(
      "bg-white rounded-full flex items-center justify-center border border-border shadow-sm overflow-hidden shrink-0 relative transition-all duration-300",
      sizeClasses[size],
      className
    )}>
      {showImage ? (
        <img 
          src={avatarValue} 
          alt={user?.name} 
          className="w-full h-full object-cover animate-in fade-in duration-500" 
          loading="lazy"
        />
      ) : (
        <span className="select-none">
          {isImageAvatar ? "🐱" : avatarValue}
        </span>
      )}
      {isPremium && !isExpired && size !== 'sm' && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white shadow-sm" />
      )}
    </div>
  );
}
