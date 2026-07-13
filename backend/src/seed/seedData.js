const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../../../.env' });

const User = require('../models/User');
const Property = require('../models/Property');
const SavedProperty = require('../models/SavedProperty');
const SiteVisit = require('../models/SiteVisit');
const Notification = require('../models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/realestatedb';

const properties = [
  {
    title: 'Prestige Skyline Residences',
    description: 'Experience luxury living at its finest in the heart of Mumbai. These premium 3 BHK apartments offer breathtaking city views, world-class amenities, and impeccable finishes. Located in the prestigious Bandra West area, these homes are designed for those who demand the best.',
    price: 285,
    priceUnit: 'Lakh',
    type: 'Apartment',
    bhk: 3,
    sqft: 1850,
    status: 'Ready to Move',
    location: { city: 'Mumbai', area: 'Bandra West', state: 'Maharashtra', address: 'Plot No. 42, Linking Road, Bandra West', coordinates: { lat: 19.0596, lng: 72.8295 } },
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    ],
    amenities: ['Swimming Pool', 'Gym', 'Parking', '24/7 Security', 'Clubhouse', 'Elevator', 'Garden', 'Children\'s Playground'],
    isVerified: true,
    isFeatured: true,
    builder: { name: 'Prestige Group', phone: '+91 9876543210', email: 'prestige@builders.com', rating: 4.8, experience: '25 years' },
    constructionProgress: {
      startDate: new Date('2022-01-01'),
      endDate: new Date('2024-06-30'),
      currentStage: 6,
      completionPercent: 100,
      stages: [
        { id: 1, title: 'Legal & Approvals', icon: '📋', status: 'Completed' },
        { id: 2, title: 'Foundation Work', icon: '🏗️', status: 'Completed' },
        { id: 3, title: 'Structure Completion', icon: '🏢', status: 'Completed' },
        { id: 4, title: 'Internal Work', icon: '🔧', status: 'Completed' },
        { id: 5, title: 'Finishing Stage', icon: '🎨', status: 'Completed' },
        { id: 6, title: 'Possession & Handover', icon: '🔑', status: 'Completed' },
      ],
    },
    tags: ['Luxury', 'Sea View', 'Premium', 'Verified'],
    rating: 4.9,
    viewCount: 1520,
  },
  {
    title: 'Godrej Emerald Heights',
    description: 'Modern 2 BHK apartments designed for the urban professional. Located in the tech hub of Whitefield, Bangalore, these homes offer smart home features, high-speed connectivity, and proximity to major IT parks. Perfect for first-time home buyers and investors alike.',
    price: 72,
    priceUnit: 'Lakh',
    type: 'Apartment',
    bhk: 2,
    sqft: 1150,
    status: 'Under Construction',
    location: { city: 'Bangalore', area: 'Whitefield', state: 'Karnataka', address: 'Survey No. 87, ITPL Main Road, Whitefield', coordinates: { lat: 12.9698, lng: 77.7500 } },
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
    ],
    amenities: ['Gym', 'Parking', '24/7 Security', 'Elevator', 'Swimming Pool', 'Garden'],
    isVerified: true,
    isFeatured: true,
    builder: { name: 'Godrej Properties', phone: '+91 9876543211', email: 'godrej@builders.com', rating: 4.7, experience: '30 years' },
    constructionProgress: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2026-12-31'),
      currentStage: 3,
      completionPercent: 45,
      stages: [
        { id: 1, title: 'Legal & Approvals', icon: '📋', status: 'Completed' },
        { id: 2, title: 'Foundation Work', icon: '🏗️', status: 'Completed' },
        { id: 3, title: 'Structure Completion', icon: '🏢', status: 'In Progress' },
        { id: 4, title: 'Internal Work', icon: '🔧', status: 'Upcoming' },
        { id: 5, title: 'Finishing Stage', icon: '🎨', status: 'Upcoming' },
        { id: 6, title: 'Possession & Handover', icon: '🔑', status: 'Upcoming' },
      ],
    },
    tags: ['IT Hub', 'Smart Home', 'Investment'],
    rating: 4.6,
    viewCount: 890,
  },
  {
    title: 'DLF The Camellias',
    description: 'Ultra-luxury penthouse residences in Gurugram\'s most coveted address. These expansive 4 BHK penthouses feature private terraces, butler service, and panoramic views of the Aravalli hills. The pinnacle of luxury living in Delhi NCR.',
    price: 18,
    priceUnit: 'Crore',
    type: 'Penthouse',
    bhk: 4,
    sqft: 6500,
    status: 'Ready to Move',
    location: { city: 'Delhi', area: 'DLF Phase 5, Gurugram', state: 'Haryana', address: 'Golf Course Road, DLF Phase 5', coordinates: { lat: 28.4595, lng: 77.0266 } },
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
    ],
    amenities: ['Swimming Pool', 'Gym', 'Parking', '24/7 Security', 'Clubhouse', 'Elevator', 'Garden', 'Spa', 'Tennis Court', 'Concierge'],
    isVerified: true,
    isFeatured: true,
    builder: { name: 'DLF Limited', phone: '+91 9876543212', email: 'dlf@builders.com', rating: 4.9, experience: '75 years' },
    constructionProgress: {
      startDate: new Date('2020-01-01'),
      endDate: new Date('2024-01-01'),
      currentStage: 6,
      completionPercent: 100,
      stages: [
        { id: 1, title: 'Legal & Approvals', icon: '📋', status: 'Completed' },
        { id: 2, title: 'Foundation Work', icon: '🏗️', status: 'Completed' },
        { id: 3, title: 'Structure Completion', icon: '🏢', status: 'Completed' },
        { id: 4, title: 'Internal Work', icon: '🔧', status: 'Completed' },
        { id: 5, title: 'Finishing Stage', icon: '🎨', status: 'Completed' },
        { id: 6, title: 'Possession & Handover', icon: '🔑', status: 'Completed' },
      ],
    },
    tags: ['Ultra Luxury', 'Penthouse', 'Golf Course View', 'Premium'],
    rating: 5.0,
    viewCount: 3200,
  },
  {
    title: 'Sobha Dream Acres',
    description: 'Affordable 1 BHK and 2 BHK apartments in the heart of Pune\'s educational hub. Well-connected to IT parks and universities, these homes are perfect for students, young professionals, and first-time buyers. Features modern amenities at competitive pricing.',
    price: 48,
    priceUnit: 'Lakh',
    type: 'Apartment',
    bhk: 2,
    sqft: 980,
    status: 'Under Construction',
    location: { city: 'Pune', area: 'Hinjewadi', state: 'Maharashtra', address: 'Phase 1, Rajiv Gandhi Infotech Park, Hinjewadi', coordinates: { lat: 18.5912, lng: 73.7389 } },
    images: [
      'https://images.unsplash.com/photo-1560185127-6a9a3b0db6f0?w=800',
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    ],
    amenities: ['Gym', 'Parking', 'Garden', 'Children\'s Playground', 'Security'],
    isVerified: true,
    isFeatured: false,
    builder: { name: 'Sobha Limited', phone: '+91 9876543213', email: 'sobha@builders.com', rating: 4.5, experience: '28 years' },
    constructionProgress: {
      startDate: new Date('2024-06-01'),
      endDate: new Date('2026-12-31'),
      currentStage: 2,
      completionPercent: 25,
      stages: [
        { id: 1, title: 'Legal & Approvals', icon: '📋', status: 'Completed' },
        { id: 2, title: 'Foundation Work', icon: '🏗️', status: 'In Progress' },
        { id: 3, title: 'Structure Completion', icon: '🏢', status: 'Upcoming' },
        { id: 4, title: 'Internal Work', icon: '🔧', status: 'Upcoming' },
        { id: 5, title: 'Finishing Stage', icon: '🎨', status: 'Upcoming' },
        { id: 6, title: 'Possession & Handover', icon: '🔑', status: 'Upcoming' },
      ],
    },
    tags: ['Affordable', 'IT Hub', 'Investment', 'Young Professionals'],
    rating: 4.3,
    viewCount: 650,
  },
  {
    title: 'My Home Avatar',
    description: 'Stunning 3 BHK luxury apartments in Hyderabad\'s Financial District. These spacious homes feature premium fittings, grand lobbies, and resort-style amenities. Located minutes from HITECH City and major corporate offices.',
    price: 115,
    priceUnit: 'Lakh',
    type: 'Apartment',
    bhk: 3,
    sqft: 2100,
    status: 'Under Construction',
    location: { city: 'Hyderabad', area: 'Financial District', state: 'Telangana', address: 'Nanakramguda, Financial District', coordinates: { lat: 17.4168, lng: 78.3489 } },
    images: [
      'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800',
    ],
    amenities: ['Swimming Pool', 'Gym', 'Parking', '24/7 Security', 'Clubhouse', 'Elevator', 'Garden', 'Badminton Court'],
    isVerified: true,
    isFeatured: true,
    builder: { name: 'My Home Group', phone: '+91 9876543214', email: 'myhome@builders.com', rating: 4.6, experience: '20 years' },
    constructionProgress: {
      startDate: new Date('2023-06-01'),
      endDate: new Date('2026-06-30'),
      currentStage: 3,
      completionPercent: 55,
      stages: [
        { id: 1, title: 'Legal & Approvals', icon: '📋', status: 'Completed' },
        { id: 2, title: 'Foundation Work', icon: '🏗️', status: 'Completed' },
        { id: 3, title: 'Structure Completion', icon: '🏢', status: 'In Progress' },
        { id: 4, title: 'Internal Work', icon: '🔧', status: 'Upcoming' },
        { id: 5, title: 'Finishing Stage', icon: '🎨', status: 'Upcoming' },
        { id: 6, title: 'Possession & Handover', icon: '🔑', status: 'Upcoming' },
      ],
    },
    tags: ['HITECH City', 'Financial District', 'Corporate Hub'],
    rating: 4.7,
    viewCount: 1100,
  },
  {
    title: 'Brigade Utopia',
    description: 'Elegant villas with private gardens in North Bangalore. These premium 4 BHK villas offer an exclusive gated community experience with private pools, landscaped gardens, and 24/7 concierge services. The perfect blend of privacy and luxury.',
    price: 3.2,
    priceUnit: 'Crore',
    type: 'Villa',
    bhk: 4,
    sqft: 3800,
    status: 'Ready to Move',
    location: { city: 'Bangalore', area: 'Devanahalli', state: 'Karnataka', address: 'NH 44, Near KIADB Aerospace Park, Devanahalli', coordinates: { lat: 13.2246, lng: 77.6890 } },
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
    ],
    amenities: ['Swimming Pool', 'Gym', 'Parking', '24/7 Security', 'Clubhouse', 'Garden', 'Tennis Court', 'Spa', 'Children\'s Playground'],
    isVerified: true,
    isFeatured: true,
    builder: { name: 'Brigade Group', phone: '+91 9876543215', email: 'brigade@builders.com', rating: 4.8, experience: '35 years' },
    constructionProgress: {
      startDate: new Date('2021-01-01'),
      endDate: new Date('2024-03-31'),
      currentStage: 6,
      completionPercent: 100,
      stages: [
        { id: 1, title: 'Legal & Approvals', icon: '📋', status: 'Completed' },
        { id: 2, title: 'Foundation Work', icon: '🏗️', status: 'Completed' },
        { id: 3, title: 'Structure Completion', icon: '🏢', status: 'Completed' },
        { id: 4, title: 'Internal Work', icon: '🔧', status: 'Completed' },
        { id: 5, title: 'Finishing Stage', icon: '🎨', status: 'Completed' },
        { id: 6, title: 'Possession & Handover', icon: '🔑', status: 'Completed' },
      ],
    },
    tags: ['Villa', 'Luxury', 'Private Pool', 'Gated Community'],
    rating: 4.9,
    viewCount: 2100,
  },
  {
    title: 'Tata Housing Primanti',
    description: 'Smart 1 BHK studio apartments ideal for young professionals and bachelors. Located in the rapidly developing Thane district, these compact yet efficient homes feature smart home automation, high-speed fiber connectivity, and modern kitchen setups.',
    price: 35,
    priceUnit: 'Lakh',
    type: 'Studio',
    bhk: 1,
    sqft: 650,
    status: 'Ready to Move',
    location: { city: 'Mumbai', area: 'Thane West', state: 'Maharashtra', address: 'Near Viviana Mall, Thane West', coordinates: { lat: 19.2183, lng: 72.9781 } },
    images: [
      'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?w=800',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800',
    ],
    amenities: ['Gym', 'Parking', 'Security', 'Elevator', 'Wi-Fi Lounge'],
    isVerified: true,
    isFeatured: false,
    builder: { name: 'Tata Housing', phone: '+91 9876543216', email: 'tata@builders.com', rating: 4.7, experience: '40 years' },
    constructionProgress: {
      startDate: new Date('2022-06-01'),
      endDate: new Date('2024-12-31'),
      currentStage: 6,
      completionPercent: 100,
      stages: [
        { id: 1, title: 'Legal & Approvals', icon: '📋', status: 'Completed' },
        { id: 2, title: 'Foundation Work', icon: '🏗️', status: 'Completed' },
        { id: 3, title: 'Structure Completion', icon: '🏢', status: 'Completed' },
        { id: 4, title: 'Internal Work', icon: '🔧', status: 'Completed' },
        { id: 5, title: 'Finishing Stage', icon: '🎨', status: 'Completed' },
        { id: 6, title: 'Possession & Handover', icon: '🔑', status: 'Completed' },
      ],
    },
    tags: ['Studio', 'Smart Home', 'Affordable', 'Young Professionals'],
    rating: 4.4,
    viewCount: 780,
  },
  {
    title: 'Mahindra Happinest Kalyan',
    description: 'Affordable 2 BHK homes designed for middle-income families. These thoughtfully designed apartments maximize space utilization with clever storage solutions, bright interiors, and family-friendly amenities. A great value proposition in Mumbai\'s suburbs.',
    price: 55,
    priceUnit: 'Lakh',
    type: 'Apartment',
    bhk: 2,
    sqft: 1080,
    status: 'Under Construction',
    location: { city: 'Mumbai', area: 'Kalyan East', state: 'Maharashtra', address: 'Station Road, Kalyan East', coordinates: { lat: 19.2437, lng: 73.1355 } },
    images: [
      'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800',
      'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800',
      'https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?w=800',
    ],
    amenities: ['Gym', 'Parking', 'Garden', 'Children\'s Playground', 'Security', 'Elevator'],
    isVerified: false,
    isFeatured: false,
    builder: { name: 'Mahindra Lifespaces', phone: '+91 9876543217', email: 'mahindra@builders.com', rating: 4.4, experience: '30 years' },
    constructionProgress: {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2027-06-30'),
      currentStage: 1,
      completionPercent: 10,
      stages: [
        { id: 1, title: 'Legal & Approvals', icon: '📋', status: 'In Progress' },
        { id: 2, title: 'Foundation Work', icon: '🏗️', status: 'Upcoming' },
        { id: 3, title: 'Structure Completion', icon: '🏢', status: 'Upcoming' },
        { id: 4, title: 'Internal Work', icon: '🔧', status: 'Upcoming' },
        { id: 5, title: 'Finishing Stage', icon: '🎨', status: 'Upcoming' },
        { id: 6, title: 'Possession & Handover', icon: '🔑', status: 'Upcoming' },
      ],
    },
    tags: ['Affordable', 'Family', 'Value for Money'],
    rating: 4.2,
    viewCount: 430,
  },
  {
    title: 'Phoenix One Bangalore West',
    description: 'Iconic high-rise apartments with stunning city skyline views in West Bangalore. These premium 3 BHK residences feature designer interiors, imported marble flooring, modular kitchens, and extensive recreational facilities spread across 8 acres.',
    price: 165,
    priceUnit: 'Lakh',
    type: 'Apartment',
    bhk: 3,
    sqft: 2200,
    status: 'Ready to Move',
    location: { city: 'Bangalore', area: 'Rajajinagar', state: 'Karnataka', address: 'Rajajinagar Industrial Area, West Bangalore', coordinates: { lat: 12.9999, lng: 77.5510 } },
    images: [
      'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
      'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800',
    ],
    amenities: ['Swimming Pool', 'Gym', 'Parking', '24/7 Security', 'Clubhouse', 'Elevator', 'Garden', 'Badminton Court', 'Squash Court'],
    isVerified: true,
    isFeatured: false,
    builder: { name: 'Phoenix Mills', phone: '+91 9876543218', email: 'phoenix@builders.com', rating: 4.6, experience: '20 years' },
    constructionProgress: {
      startDate: new Date('2020-06-01'),
      endDate: new Date('2024-06-30'),
      currentStage: 6,
      completionPercent: 100,
      stages: [
        { id: 1, title: 'Legal & Approvals', icon: '📋', status: 'Completed' },
        { id: 2, title: 'Foundation Work', icon: '🏗️', status: 'Completed' },
        { id: 3, title: 'Structure Completion', icon: '🏢', status: 'Completed' },
        { id: 4, title: 'Internal Work', icon: '🔧', status: 'Completed' },
        { id: 5, title: 'Finishing Stage', icon: '🎨', status: 'Completed' },
        { id: 6, title: 'Possession & Handover', icon: '🔑', status: 'Completed' },
      ],
    },
    tags: ['High Rise', 'City View', 'Premium', 'Verified'],
    rating: 4.7,
    viewCount: 1350,
  },
  {
    title: 'Hiranandani Gardens',
    description: 'The iconic township of Hiranandani Gardens offers a complete self-sufficient community in Powai. These well-appointed 2 BHK apartments are surrounded by lush greenery, a bustling high street, schools, hospitals, and entertainment options.',
    price: 195,
    priceUnit: 'Lakh',
    type: 'Apartment',
    bhk: 2,
    sqft: 1320,
    status: 'Ready to Move',
    location: { city: 'Mumbai', area: 'Powai', state: 'Maharashtra', address: 'Hiranandani Gardens, Powai', coordinates: { lat: 19.1176, lng: 72.9060 } },
    images: [
      'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800',
    ],
    amenities: ['Swimming Pool', 'Gym', 'Parking', '24/7 Security', 'Clubhouse', 'Elevator', 'Garden', 'Jogging Track', 'Children\'s Playground'],
    isVerified: true,
    isFeatured: true,
    builder: { name: 'Hiranandani Group', phone: '+91 9876543219', email: 'hiranandani@builders.com', rating: 4.9, experience: '45 years' },
    constructionProgress: {
      startDate: new Date('2019-01-01'),
      endDate: new Date('2023-12-31'),
      currentStage: 6,
      completionPercent: 100,
      stages: [
        { id: 1, title: 'Legal & Approvals', icon: '📋', status: 'Completed' },
        { id: 2, title: 'Foundation Work', icon: '🏗️', status: 'Completed' },
        { id: 3, title: 'Structure Completion', icon: '🏢', status: 'Completed' },
        { id: 4, title: 'Internal Work', icon: '🔧', status: 'Completed' },
        { id: 5, title: 'Finishing Stage', icon: '🎨', status: 'Completed' },
        { id: 6, title: 'Possession & Handover', icon: '🔑', status: 'Completed' },
      ],
    },
    tags: ['Township', 'Premium', 'Lake View', 'IIT Bombay Nearby'],
    rating: 4.8,
    viewCount: 2800,
  },
  {
    title: 'Purva Skydale',
    description: 'New launch premium 3 BHK apartments in Electronic City, Bangalore. Designed for the tech-savvy homeowner with smart home features, high-speed connectivity, and easy access to all major IT companies. Limited units available at pre-launch prices.',
    price: 88,
    priceUnit: 'Lakh',
    type: 'Apartment',
    bhk: 3,
    sqft: 1680,
    status: 'New Launch',
    location: { city: 'Bangalore', area: 'Electronic City', state: 'Karnataka', address: 'Hosur Road, Electronic City Phase 1', coordinates: { lat: 12.8458, lng: 77.6617 } },
    images: [
      'https://images.unsplash.com/photo-1626885930974-4b69aa21bbf9?w=800',
      'https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?w=800',
      'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=800',
    ],
    amenities: ['Swimming Pool', 'Gym', 'Parking', '24/7 Security', 'Clubhouse', 'Elevator', 'Garden'],
    isVerified: true,
    isFeatured: true,
    builder: { name: 'Puravankara', phone: '+91 9876543220', email: 'purva@builders.com', rating: 4.5, experience: '45 years' },
    constructionProgress: {
      startDate: new Date('2025-06-01'),
      endDate: new Date('2027-12-31'),
      currentStage: 1,
      completionPercent: 5,
      stages: [
        { id: 1, title: 'Legal & Approvals', icon: '📋', status: 'In Progress' },
        { id: 2, title: 'Foundation Work', icon: '🏗️', status: 'Upcoming' },
        { id: 3, title: 'Structure Completion', icon: '🏢', status: 'Upcoming' },
        { id: 4, title: 'Internal Work', icon: '🔧', status: 'Upcoming' },
        { id: 5, title: 'Finishing Stage', icon: '🎨', status: 'Upcoming' },
        { id: 6, title: 'Possession & Handover', icon: '🔑', status: 'Upcoming' },
      ],
    },
    tags: ['New Launch', 'Pre-Launch Price', 'Electronic City', 'Investment'],
    rating: 4.5,
    viewCount: 320,
  },
  {
    title: 'Shapoorji Pallonji Joyville',
    description: 'Spacious 3 BHK apartments in the premium locality of Hadapsar, Pune. These contemporary residences feature large balconies, modular kitchens, and world-class amenities. Strategically located near the IT corridor with excellent connectivity.',
    price: 95,
    priceUnit: 'Lakh',
    type: 'Apartment',
    bhk: 3,
    sqft: 1750,
    status: 'Under Construction',
    location: { city: 'Pune', area: 'Hadapsar', state: 'Maharashtra', address: 'Magarpatta Road, Hadapsar', coordinates: { lat: 18.5018, lng: 73.9259 } },
    images: [
      'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
      'https://images.unsplash.com/photo-1522156373667-4c7234bbd804?w=800',
    ],
    amenities: ['Swimming Pool', 'Gym', 'Parking', '24/7 Security', 'Clubhouse', 'Garden', 'Jogging Track'],
    isVerified: true,
    isFeatured: false,
    builder: { name: 'Shapoorji Pallonji', phone: '+91 9876543221', email: 'sp@builders.com', rating: 4.8, experience: '155 years' },
    constructionProgress: {
      startDate: new Date('2023-12-01'),
      endDate: new Date('2026-06-30'),
      currentStage: 2,
      completionPercent: 30,
      stages: [
        { id: 1, title: 'Legal & Approvals', icon: '📋', status: 'Completed' },
        { id: 2, title: 'Foundation Work', icon: '🏗️', status: 'In Progress' },
        { id: 3, title: 'Structure Completion', icon: '🏢', status: 'Upcoming' },
        { id: 4, title: 'Internal Work', icon: '🔧', status: 'Upcoming' },
        { id: 5, title: 'Finishing Stage', icon: '🎨', status: 'Upcoming' },
        { id: 6, title: 'Possession & Handover', icon: '🔑', status: 'Upcoming' },
      ],
    },
    tags: ['IT Corridor', 'Pune', 'Premium Builder', 'Investment'],
    rating: 4.7,
    viewCount: 720,
  },
  {
    title: 'Ramky One North',
    description: 'Luxurious 2 and 3 BHK apartments in the thriving Kompally locality of Hyderabad. These spacious residences feature Italian marble flooring, modular kitchens, and an extensive 4-acre recreational zone with resort-style amenities.',
    price: 78,
    priceUnit: 'Lakh',
    type: 'Apartment',
    bhk: 2,
    sqft: 1380,
    status: 'Ready to Move',
    location: { city: 'Hyderabad', area: 'Kompally', state: 'Telangana', address: 'Survey No. 234, Kompally', coordinates: { lat: 17.5550, lng: 78.4804 } },
    images: [
      'https://images.unsplash.com/photo-1600047508788-786f3865b587?w=800',
      'https://images.unsplash.com/photo-1585518382094-60e78e14c3e8?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    ],
    amenities: ['Swimming Pool', 'Gym', 'Parking', '24/7 Security', 'Clubhouse', 'Elevator', 'Garden', 'Badminton Court'],
    isVerified: true,
    isFeatured: false,
    builder: { name: 'Ramky Group', phone: '+91 9876543222', email: 'ramky@builders.com', rating: 4.5, experience: '30 years' },
    constructionProgress: {
      startDate: new Date('2021-06-01'),
      endDate: new Date('2024-12-31'),
      currentStage: 6,
      completionPercent: 100,
      stages: [
        { id: 1, title: 'Legal & Approvals', icon: '📋', status: 'Completed' },
        { id: 2, title: 'Foundation Work', icon: '🏗️', status: 'Completed' },
        { id: 3, title: 'Structure Completion', icon: '🏢', status: 'Completed' },
        { id: 4, title: 'Internal Work', icon: '🔧', status: 'Completed' },
        { id: 5, title: 'Finishing Stage', icon: '🎨', status: 'Completed' },
        { id: 6, title: 'Possession & Handover', icon: '🔑', status: 'Completed' },
      ],
    },
    tags: ['Ready to Move', 'Hyderabad', 'Luxury', 'Premium Builder'],
    rating: 4.5,
    viewCount: 890,
  },
  {
    title: 'Lodha World Towers',
    description: 'Magnificent ultra-luxury sky villas in Lower Parel, Mumbai\'s new business hub. Standing among the tallest residential towers in the world, these exclusive 4 BHK sky villas offer unparalleled views of the Arabian Sea, Mumbai skyline, and the city\'s iconic landmarks.',
    price: 12.5,
    priceUnit: 'Crore',
    type: 'Apartment',
    bhk: 4,
    sqft: 4200,
    status: 'Ready to Move',
    location: { city: 'Mumbai', area: 'Lower Parel', state: 'Maharashtra', address: 'NM Joshi Marg, Lower Parel', coordinates: { lat: 18.9989, lng: 72.8313 } },
    images: [
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
      'https://images.unsplash.com/photo-1560449752-8b6f8db6a9b2?w=800',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800',
    ],
    amenities: ['Swimming Pool', 'Gym', 'Parking', '24/7 Security', 'Clubhouse', 'Elevator', 'Garden', 'Spa', 'Tennis Court', 'Cinema', 'Concierge', 'Helipad'],
    isVerified: true,
    isFeatured: true,
    builder: { name: 'Lodha Group', phone: '+91 9876543223', email: 'lodha@builders.com', rating: 4.9, experience: '35 years' },
    constructionProgress: {
      startDate: new Date('2018-01-01'),
      endDate: new Date('2023-06-30'),
      currentStage: 6,
      completionPercent: 100,
      stages: [
        { id: 1, title: 'Legal & Approvals', icon: '📋', status: 'Completed' },
        { id: 2, title: 'Foundation Work', icon: '🏗️', status: 'Completed' },
        { id: 3, title: 'Structure Completion', icon: '🏢', status: 'Completed' },
        { id: 4, title: 'Internal Work', icon: '🔧', status: 'Completed' },
        { id: 5, title: 'Finishing Stage', icon: '🎨', status: 'Completed' },
        { id: 6, title: 'Possession & Handover', icon: '🔑', status: 'Completed' },
      ],
    },
    tags: ['Sky Villa', 'Sea View', 'Ultra Luxury', 'Trophy Property'],
    rating: 5.0,
    viewCount: 5100,
  },
  {
    title: 'Assetz 63 Degree East',
    description: 'Contemporary 1 BHK smart apartments for the new-age urban dweller in Sarjapur Road, Bangalore. These compact, well-designed units come pre-fitted with smart home automation, modular furniture, and are ideal for bachelors and IT professionals.',
    price: 42,
    priceUnit: 'Lakh',
    type: 'Apartment',
    bhk: 1,
    sqft: 750,
    status: 'Under Construction',
    location: { city: 'Bangalore', area: 'Sarjapur Road', state: 'Karnataka', address: 'Outer Ring Road, Sarjapur Road Junction', coordinates: { lat: 12.9088, lng: 77.6875 } },
    images: [
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    ],
    amenities: ['Gym', 'Parking', 'Security', 'Elevator', 'Coworking Space', 'Rooftop Garden'],
    isVerified: false,
    isFeatured: false,
    builder: { name: 'Assetz Property Group', phone: '+91 9876543224', email: 'assetz@builders.com', rating: 4.3, experience: '12 years' },
    constructionProgress: {
      startDate: new Date('2024-09-01'),
      endDate: new Date('2027-03-31'),
      currentStage: 1,
      completionPercent: 15,
      stages: [
        { id: 1, title: 'Legal & Approvals', icon: '📋', status: 'Completed' },
        { id: 2, title: 'Foundation Work', icon: '🏗️', status: 'In Progress' },
        { id: 3, title: 'Structure Completion', icon: '🏢', status: 'Upcoming' },
        { id: 4, title: 'Internal Work', icon: '🔧', status: 'Upcoming' },
        { id: 5, title: 'Finishing Stage', icon: '🎨', status: 'Upcoming' },
        { id: 6, title: 'Possession & Handover', icon: '🔑', status: 'Upcoming' },
      ],
    },
    tags: ['1 BHK', 'Smart Home', 'IT Hub', 'Affordable'],
    rating: 4.3,
    viewCount: 510,
  },
];

const seedDatabase = async (uri) => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(uri || MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Property.deleteMany({});
    await SavedProperty.deleteMany({});
    await SiteVisit.deleteMany({});
    await Notification.deleteMany({});

    // Create test users
    console.log('👤 Creating users...');
    const testUser = await User.create({
      name: 'Rahul Sharma',
      email: 'test@realestate.com',
      password: 'Test@123',
      phone: '+91 9876543200',
      locationPreference: 'Mumbai',
      preferredTypes: ['Apartment', '3 BHK'],
      budgetRange: { min: 50, max: 200 },
    });

    const testUser2 = await User.create({
      name: 'Priya Singh',
      email: 'priya@realestate.com',
      password: 'Test@123',
      phone: '+91 9876543201',
      locationPreference: 'Bangalore',
    });

    // Create properties
    console.log('🏠 Creating 15 properties...');
    const createdProperties = await Property.insertMany(properties);
    console.log(`✅ Created ${createdProperties.length} properties`);

    // Save some properties for test user
    await SavedProperty.create([
      { userId: testUser._id, propertyId: createdProperties[0]._id },
      { userId: testUser._id, propertyId: createdProperties[4]._id },
      { userId: testUser._id, propertyId: createdProperties[9]._id },
    ]);

    // Create sample site visits
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 14);

    await SiteVisit.create([
      {
        userId: testUser._id,
        propertyId: createdProperties[0]._id,
        date: futureDate,
        timeSlot: '10:00 AM - 11:00 AM',
        visitorName: 'Rahul Sharma',
        visitorPhone: '+91 9876543200',
        visitorEmail: 'test@realestate.com',
        status: 'upcoming',
      },
      {
        userId: testUser._id,
        propertyId: createdProperties[2]._id,
        date: pastDate,
        timeSlot: '2:00 PM - 3:00 PM',
        visitorName: 'Rahul Sharma',
        visitorPhone: '+91 9876543200',
        visitorEmail: 'test@realestate.com',
        status: 'completed',
      },
    ]);

    // Create sample notifications
    await Notification.create([
      {
        userId: testUser._id,
        type: 'new_property',
        title: 'New Property in Mumbai!',
        message: 'A new 3 BHK in Bandra West matches your preferences',
        propertyId: createdProperties[0]._id,
        isRead: false,
      },
      {
        userId: testUser._id,
        type: 'price_drop',
        title: 'Price Drop Alert! 🔥',
        message: 'Godrej Emerald Heights price reduced by ₹5 Lakhs',
        propertyId: createdProperties[1]._id,
        isRead: false,
      },
      {
        userId: testUser._id,
        type: 'visit_reminder',
        title: 'Site Visit Tomorrow!',
        message: 'Your visit to Prestige Skyline is scheduled for tomorrow at 10:00 AM',
        propertyId: createdProperties[0]._id,
        isRead: true,
      },
      {
        userId: testUser._id,
        type: 'construction_update',
        title: 'Construction Update',
        message: 'My Home Avatar has completed Foundation Work stage',
        propertyId: createdProperties[4]._id,
        isRead: false,
      },
    ]);

    console.log('\n🎉 Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Test User 1: test@realestate.com / Test@123');
    console.log('📧 Test User 2: priya@realestate.com / Test@123');
    console.log(`🏠 Properties: ${createdProperties.length} created`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Seed error:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
} else {
  module.exports = seedDatabase;
}
