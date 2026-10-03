// Company constraints, form factors, and hardware rules
export const BRAND_RULES = {
  "Acer": {
    "types": [
      "2 in 1 Convertible",
      "Gaming",
      "Netbook",
      "Notebook",
      "Ultrabook"
    ],
    "default_type": "2 in 1 Convertible",
    "os": [
      "Chrome OS",
      "Linux",
      "Windows"
    ],
    "default_os": "Windows",
    "cpu_brands": [
      "AMD",
      "Intel Other",
      "Intel i3",
      "Intel i5",
      "Intel i7"
    ],
    "storage_types": [
      "HDD",
      "Hybrid",
      "SSD"
    ],
    "touchscreen_supported": true,
    "has_dedicated_gpu": true,
    "dedicated_gpu_options": [
      "AMD",
      "Nvidia"
    ],
    "inches_range": [
      11.6,
      17.3
    ],
    "typical_weight": 2.2
  },
  "Apple": {
    "types": [
      "Ultrabook"
    ],
    "default_type": "Ultrabook",
    "os": [
      "Mac"
    ],
    "default_os": "Mac",
    "cpu_brands": [
      "Intel Other",
      "Intel i5",
      "Intel i7"
    ],
    "storage_types": [
      "SSD"
    ],
    "touchscreen_supported": false,
    "has_dedicated_gpu": true,
    "dedicated_gpu_options": [
      "AMD"
    ],
    "inches_range": [
      11.6,
      15.4
    ],
    "typical_weight": 1.35
  },
  "Asus": {
    "types": [
      "2 in 1 Convertible",
      "Gaming",
      "Netbook",
      "Notebook",
      "Ultrabook"
    ],
    "default_type": "2 in 1 Convertible",
    "os": [
      "Chrome OS",
      "Linux",
      "No OS",
      "Windows"
    ],
    "default_os": "Windows",
    "cpu_brands": [
      "AMD",
      "Intel Other",
      "Intel i3",
      "Intel i5",
      "Intel i7"
    ],
    "storage_types": [
      "HDD",
      "Hybrid",
      "SSD"
    ],
    "touchscreen_supported": true,
    "has_dedicated_gpu": true,
    "dedicated_gpu_options": [
      "AMD",
      "Nvidia"
    ],
    "inches_range": [
      11.6,
      17.3
    ],
    "typical_weight": 2.2
  },
  "Chuwi": {
    "types": [
      "Notebook"
    ],
    "default_type": "Notebook",
    "os": [
      "Windows"
    ],
    "default_os": "Windows",
    "cpu_brands": [
      "Intel Other"
    ],
    "storage_types": [
      "SSD"
    ],
    "touchscreen_supported": false,
    "has_dedicated_gpu": false,
    "dedicated_gpu_options": [
      "Nvidia"
    ],
    "inches_range": [
      12.3,
      15.6
    ],
    "typical_weight": 1.89
  },
  "Dell": {
    "types": [
      "2 in 1 Convertible",
      "Gaming",
      "Netbook",
      "Notebook",
      "Ultrabook",
      "Workstation"
    ],
    "default_type": "2 in 1 Convertible",
    "os": [
      "Chrome OS",
      "Linux",
      "Windows"
    ],
    "default_os": "Windows",
    "cpu_brands": [
      "Intel Other",
      "Intel i3",
      "Intel i5",
      "Intel i7"
    ],
    "storage_types": [
      "HDD",
      "Hybrid",
      "Other",
      "SSD"
    ],
    "touchscreen_supported": true,
    "has_dedicated_gpu": true,
    "dedicated_gpu_options": [
      "AMD",
      "Nvidia"
    ],
    "inches_range": [
      11.6,
      17.3
    ],
    "typical_weight": 2.18
  },
  "Fujitsu": {
    "types": [
      "Notebook"
    ],
    "default_type": "Notebook",
    "os": [
      "Windows"
    ],
    "default_os": "Windows",
    "cpu_brands": [
      "Intel i5"
    ],
    "storage_types": [
      "HDD",
      "SSD"
    ],
    "touchscreen_supported": false,
    "has_dedicated_gpu": false,
    "dedicated_gpu_options": [
      "Nvidia"
    ],
    "inches_range": [
      15.6,
      15.6
    ],
    "typical_weight": 2.2
  },
  "Google": {
    "types": [
      "Ultrabook"
    ],
    "default_type": "Ultrabook",
    "os": [
      "Chrome OS"
    ],
    "default_os": "Chrome OS",
    "cpu_brands": [
      "Intel i5",
      "Intel i7"
    ],
    "storage_types": [
      "SSD"
    ],
    "touchscreen_supported": true,
    "has_dedicated_gpu": false,
    "dedicated_gpu_options": [
      "Nvidia"
    ],
    "inches_range": [
      12.3,
      12.3
    ],
    "typical_weight": 1.1
  },
  "HP": {
    "types": [
      "2 in 1 Convertible",
      "Gaming",
      "Netbook",
      "Notebook",
      "Ultrabook",
      "Workstation"
    ],
    "default_type": "2 in 1 Convertible",
    "os": [
      "Chrome OS",
      "No OS",
      "Windows"
    ],
    "default_os": "Windows",
    "cpu_brands": [
      "AMD",
      "Intel Other",
      "Intel i3",
      "Intel i5",
      "Intel i7"
    ],
    "storage_types": [
      "HDD",
      "Hybrid",
      "Other",
      "SSD"
    ],
    "touchscreen_supported": true,
    "has_dedicated_gpu": true,
    "dedicated_gpu_options": [
      "AMD",
      "Nvidia"
    ],
    "inches_range": [
      11.6,
      17.3
    ],
    "typical_weight": 1.89
  },
  "Huawei": {
    "types": [
      "Ultrabook"
    ],
    "default_type": "Ultrabook",
    "os": [
      "Windows"
    ],
    "default_os": "Windows",
    "cpu_brands": [
      "Intel i5",
      "Intel i7"
    ],
    "storage_types": [
      "SSD"
    ],
    "touchscreen_supported": false,
    "has_dedicated_gpu": false,
    "dedicated_gpu_options": [
      "Nvidia"
    ],
    "inches_range": [
      13.0,
      13.0
    ],
    "typical_weight": 1.05
  },
  "LG": {
    "types": [
      "Ultrabook"
    ],
    "default_type": "Ultrabook",
    "os": [
      "Windows"
    ],
    "default_os": "Windows",
    "cpu_brands": [
      "Intel i7"
    ],
    "storage_types": [
      "SSD"
    ],
    "touchscreen_supported": true,
    "has_dedicated_gpu": false,
    "dedicated_gpu_options": [
      "Nvidia"
    ],
    "inches_range": [
      14.0,
      15.6
    ],
    "typical_weight": 1.08
  },
  "Lenovo": {
    "types": [
      "2 in 1 Convertible",
      "Gaming",
      "Netbook",
      "Notebook",
      "Ultrabook",
      "Workstation"
    ],
    "default_type": "2 in 1 Convertible",
    "os": [
      "Android",
      "Chrome OS",
      "No OS",
      "Windows"
    ],
    "default_os": "Windows",
    "cpu_brands": [
      "AMD",
      "Intel Other",
      "Intel i3",
      "Intel i5",
      "Intel i7"
    ],
    "storage_types": [
      "HDD",
      "Hybrid",
      "Other",
      "SSD"
    ],
    "touchscreen_supported": true,
    "has_dedicated_gpu": true,
    "dedicated_gpu_options": [
      "AMD",
      "Nvidia"
    ],
    "inches_range": [
      10.1,
      17.3
    ],
    "typical_weight": 2.1
  },
  "MSI": {
    "types": [
      "Gaming"
    ],
    "default_type": "Gaming",
    "os": [
      "Windows"
    ],
    "default_os": "Windows",
    "cpu_brands": [
      "Intel i5",
      "Intel i7"
    ],
    "storage_types": [
      "HDD",
      "Hybrid",
      "SSD"
    ],
    "touchscreen_supported": false,
    "has_dedicated_gpu": true,
    "dedicated_gpu_options": [
      "Nvidia"
    ],
    "inches_range": [
      14.0,
      18.4
    ],
    "typical_weight": 2.52
  },
  "Mediacom": {
    "types": [
      "2 in 1 Convertible",
      "Notebook"
    ],
    "default_type": "2 in 1 Convertible",
    "os": [
      "Windows"
    ],
    "default_os": "Windows",
    "cpu_brands": [
      "Intel Other"
    ],
    "storage_types": [
      "HDD",
      "SSD"
    ],
    "touchscreen_supported": true,
    "has_dedicated_gpu": false,
    "dedicated_gpu_options": [
      "Nvidia"
    ],
    "inches_range": [
      11.6,
      14.0
    ],
    "typical_weight": 1.4
  },
  "Microsoft": {
    "types": [
      "Ultrabook"
    ],
    "default_type": "Ultrabook",
    "os": [
      "Windows"
    ],
    "default_os": "Windows",
    "cpu_brands": [
      "Intel Other",
      "Intel i5",
      "Intel i7"
    ],
    "storage_types": [
      "SSD"
    ],
    "touchscreen_supported": true,
    "has_dedicated_gpu": false,
    "dedicated_gpu_options": [
      "Nvidia"
    ],
    "inches_range": [
      13.5,
      13.5
    ],
    "typical_weight": 1.25
  },
  "Razer": {
    "types": [
      "Gaming",
      "Ultrabook"
    ],
    "default_type": "Gaming",
    "os": [
      "Windows"
    ],
    "default_os": "Windows",
    "cpu_brands": [
      "Intel i7"
    ],
    "storage_types": [
      "SSD"
    ],
    "touchscreen_supported": true,
    "has_dedicated_gpu": true,
    "dedicated_gpu_options": [
      "Nvidia"
    ],
    "inches_range": [
      12.5,
      17.3
    ],
    "typical_weight": 1.95
  },
  "Samsung": {
    "types": [
      "2 in 1 Convertible",
      "Netbook",
      "Notebook",
      "Ultrabook"
    ],
    "default_type": "2 in 1 Convertible",
    "os": [
      "Chrome OS",
      "Windows"
    ],
    "default_os": "Windows",
    "cpu_brands": [
      "Intel Other",
      "Intel i5",
      "Intel i7",
      "Other"
    ],
    "storage_types": [
      "Hybrid",
      "SSD"
    ],
    "touchscreen_supported": true,
    "has_dedicated_gpu": true,
    "dedicated_gpu_options": [
      "AMD",
      "Nvidia"
    ],
    "inches_range": [
      11.6,
      15.6
    ],
    "typical_weight": 1.17
  },
  "Toshiba": {
    "types": [
      "Notebook",
      "Ultrabook"
    ],
    "default_type": "Notebook",
    "os": [
      "Windows"
    ],
    "default_os": "Windows",
    "cpu_brands": [
      "Intel Other",
      "Intel i3",
      "Intel i5",
      "Intel i7"
    ],
    "storage_types": [
      "HDD",
      "SSD"
    ],
    "touchscreen_supported": true,
    "has_dedicated_gpu": true,
    "dedicated_gpu_options": [
      "Nvidia"
    ],
    "inches_range": [
      12.5,
      15.6
    ],
    "typical_weight": 1.5
  },
  "Vero": {
    "types": [
      "Notebook"
    ],
    "default_type": "Notebook",
    "os": [
      "Windows"
    ],
    "default_os": "Windows",
    "cpu_brands": [
      "Intel Other"
    ],
    "storage_types": [
      "SSD"
    ],
    "touchscreen_supported": false,
    "has_dedicated_gpu": false,
    "dedicated_gpu_options": [
      "Nvidia"
    ],
    "inches_range": [
      13.3,
      14.0
    ],
    "typical_weight": 1.33
  },
  "Xiaomi": {
    "types": [
      "Notebook",
      "Ultrabook"
    ],
    "default_type": "Notebook",
    "os": [
      "No OS",
      "Windows"
    ],
    "default_os": "Windows",
    "cpu_brands": [
      "Intel i5",
      "Intel i7"
    ],
    "storage_types": [
      "SSD"
    ],
    "touchscreen_supported": false,
    "has_dedicated_gpu": true,
    "dedicated_gpu_options": [
      "Nvidia"
    ],
    "inches_range": [
      13.3,
      15.6
    ],
    "typical_weight": 1.62
  }
};
