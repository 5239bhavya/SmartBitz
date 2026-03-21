"""
MSME Dummy Supplier Data — Fallback for when Supabase DB and Government API are unavailable.

This data represents realistic Indian MSME enterprises based on UDYAM Registration categories.
Used exclusively by fetch_food_processing_msme() in app.py as a Priority 3 fallback.
"""

MSME_DUMMY_DATA = {
    "records": [
        # Food & Beverages Suppliers
        {
            "EnterpriseName": "Shree Krishna Food Products",
            "District": "MUMBAI",
            "State": "MAHARASHTRA",
            "EnterpriseType": "Small",
            "MajorActivity": "Manufacturing",
            "NIC5DigitCode": "10712",
            "WhetherProdCommenced": "YES",
            "RegistrationDate": "2022-03-15",
            "social_category": "General",
            "contact_phone": "+91 22 2345 6789",
            "contact_email": "info@skfoodproducts.com"
        },
        {
            "EnterpriseName": "Annapurna Spices & Masala",
            "District": "DELHI",
            "State": "DELHI",
            "EnterpriseType": "Micro",
            "MajorActivity": "Manufacturing",
            "NIC5DigitCode": "10751",
            "WhetherProdCommenced": "YES",
            "RegistrationDate": "2021-08-20",
            "social_category": "General",
            "contact_phone": "+91 11 4567 8901",
            "contact_email": "sales@annapurnaspices.in"
        },
        {
            "EnterpriseName": "Fresh Valley Organic Foods",
            "District": "BANGALORE",
            "State": "KARNATAKA",
            "EnterpriseType": "Small",
            "MajorActivity": "Manufacturing",
            "NIC5DigitCode": "10320",
            "WhetherProdCommenced": "YES",
            "RegistrationDate": "2023-01-10",
            "social_category": "General",
            "contact_phone": "+91 80 2234 5678",
            "contact_email": "contact@freshvalley.co.in"
        },
        {
            "EnterpriseName": "Golden Harvest Flour Mills",
            "District": "LUDHIANA",
            "State": "PUNJAB",
            "EnterpriseType": "Medium",
            "MajorActivity": "Manufacturing",
            "NIC5DigitCode": "10611",
            "WhetherProdCommenced": "YES",
            "RegistrationDate": "2020-05-12",
            "social_category": "General",
            "contact_phone": "+91 161 234 5678",
            "contact_email": "info@goldenharvest.com"
        },
        {
            "EnterpriseName": "Dairy Fresh Products Ltd",
            "District": "PUNE",
            "State": "MAHARASHTRA",
            "EnterpriseType": "Small",
            "MajorActivity": "Manufacturing",
            "NIC5DigitCode": "10501",
            "WhetherProdCommenced": "YES",
            "RegistrationDate": "2021-11-25",
            "social_category": "General",
            "contact_phone": "+91 20 3456 7890",
            "contact_email": "orders@dairyfresh.in"
        },

        # Textile & Clothing Suppliers
        {
            "EnterpriseName": "Rajasthan Handloom Exports",
            "District": "JAIPUR",
            "State": "RAJASTHAN",
            "EnterpriseType": "Small",
            "MajorActivity": "Manufacturing",
            "NIC5DigitCode": "13201",
            "WhetherProdCommenced": "YES",
            "RegistrationDate": "2019-07-18",
            "social_category": "General",
            "contact_phone": "+91 141 234 5678",
            "contact_email": "export@rajhandloom.com"
        },
        {
            "EnterpriseName": "Cotton Craft Textiles",
            "District": "COIMBATORE",
            "State": "TAMIL NADU",
            "EnterpriseType": "Medium",
            "MajorActivity": "Manufacturing",
            "NIC5DigitCode": "13101",
            "WhetherProdCommenced": "YES",
            "RegistrationDate": "2018-03-22",
            "social_category": "General",
            "contact_phone": "+91 422 345 6789",
            "contact_email": "sales@cottoncraft.co.in"
        },
        {
            "EnterpriseName": "Fashion Forward Garments",
            "District": "SURAT",
            "State": "GUJARAT",
            "EnterpriseType": "Small",
            "MajorActivity": "Manufacturing",
            "NIC5DigitCode": "14101",
            "WhetherProdCommenced": "YES",
            "RegistrationDate": "2022-09-05",
            "social_category": "General",
            "contact_phone": "+91 261 456 7890",
            "contact_email": "info@fashionforward.in"
        },

        # Electronics & Technology
        {
            "EnterpriseName": "TechVision Electronics",
            "District": "NOIDA",
            "State": "UTTAR PRADESH",
            "EnterpriseType": "Small",
            "MajorActivity": "Manufacturing",
            "NIC5DigitCode": "26401",
            "WhetherProdCommenced": "YES",
            "RegistrationDate": "2021-06-14",
            "social_category": "General",
            "contact_phone": "+91 120 567 8901",
            "contact_email": "contact@techvision.in"
        },
        {
            "EnterpriseName": "Smart Components India",
            "District": "CHENNAI",
            "State": "TAMIL NADU",
            "EnterpriseType": "Medium",
            "MajorActivity": "Manufacturing",
            "NIC5DigitCode": "26110",
            "WhetherProdCommenced": "YES",
            "RegistrationDate": "2020-02-28",
            "social_category": "General",
            "contact_phone": "+91 44 2345 6789",
            "contact_email": "sales@smartcomponents.co.in"
        },

        # Agriculture & Raw Materials
        {
            "EnterpriseName": "Green Fields Agro Suppliers",
            "District": "NASHIK",
            "State": "MAHARASHTRA",
            "EnterpriseType": "Micro",
            "MajorActivity": "Services",
            "NIC5DigitCode": "01110",
            "WhetherProdCommenced": "YES",
            "RegistrationDate": "2022-04-10",
            "social_category": "General",
            "contact_phone": "+91 253 234 5678",
            "contact_email": "info@greenfields.in"
        },
        {
            "EnterpriseName": "Indus Bio-Fertilizers",
            "District": "NAGPUR",
            "State": "MAHARASHTRA",
            "EnterpriseType": "Small",
            "MajorActivity": "Manufacturing",
            "NIC5DigitCode": "20121",  # Fertilizer (NIC code)
            "WhetherProdCommenced": "YES",
            "RegistrationDate": "2021-09-15",
            "social_category": "General",
            "contact_phone": "+91 712 345 6789",
            "contact_email": "sales@indusbio.in"
        },

        # Packaging & Industrial (Raw Materials)
        {
            "EnterpriseName": "EcoPack Corrugated Solutions",
            "District": "AHMEDABAD",
            "State": "GUJARAT",
            "EnterpriseType": "Small",
            "MajorActivity": "Manufacturing",
            "NIC5DigitCode": "17021",
            "WhetherProdCommenced": "YES",
            "RegistrationDate": "2023-02-18",
            "social_category": "General",
            "contact_phone": "+91 79 4567 8901",
            "contact_email": "sales@ecopack.in"
        },
        {
            "EnterpriseName": "Bharat Chemicals & polymers",
            "District": "VADODARA",
            "State": "GUJARAT",
            "EnterpriseType": "Medium",
            "MajorActivity": "Manufacturing",
            "NIC5DigitCode": "20111",  # Basic Chemicals (NIC code)
            "WhetherProdCommenced": "YES",
            "RegistrationDate": "2019-11-12",
            "social_category": "General",
            "contact_phone": "+91 265 234 5678",
            "contact_email": "orders@bharatchem.com"
        },

        # Export Partners
        {
            "EnterpriseName": "Global Sea-Air Logistics",
            "District": "MUMBAI",
            "State": "MAHARASHTRA",
            "EnterpriseType": "Small",
            "MajorActivity": "Services",
            "NIC5DigitCode": "52291",  # Freight forwarding (NIC code)
            "WhetherProdCommenced": "YES",
            "RegistrationDate": "2020-08-15",
            "social_category": "General",
            "contact_phone": "+91 22 6789 0123",
            "contact_email": "export@globalseaair.in"
        },
        {
            "EnterpriseName": "Export Quality Assurance Hub",
            "District": "DELHI",
            "State": "DELHI",
            "EnterpriseType": "Small",
            "MajorActivity": "Services",
            "NIC5DigitCode": "74909",  # Quality inspection (NIC code)
            "WhetherProdCommenced": "YES",
            "RegistrationDate": "2021-05-10",
            "social_category": "General",
            "contact_phone": "+91 11 4567 8901",
            "contact_email": "info@exportqa.hub"
        },

        # Handicrafts & Artisan
        {
            "EnterpriseName": "Heritage Handicrafts",
            "District": "VARANASI",
            "State": "UTTAR PRADESH",
            "EnterpriseType": "Micro",
            "MajorActivity": "Manufacturing",
            "NIC5DigitCode": "32120",
            "WhetherProdCommenced": "YES",
            "RegistrationDate": "2021-05-08",
            "social_category": "OBC",
            "contact_phone": "+91 542 234 5678",
            "contact_email": "sales@heritagehandicrafts.in"
        },
        {
            "EnterpriseName": "Artisan Collective India",
            "District": "JAIPUR",
            "State": "RAJASTHAN",
            "EnterpriseType": "Small",
            "MajorActivity": "Manufacturing",
            "NIC5DigitCode": "31091",
            "WhetherProdCommenced": "YES",
            "RegistrationDate": "2022-07-22",
            "social_category": "General",
            "contact_phone": "+91 141 345 6789",
            "contact_email": "info@artisancollective.co.in"
        },

        # Health & Beauty
        {
            "EnterpriseName": "Ayurvedic Wellness Products",
            "District": "KERALA",
            "State": "KERALA",
            "EnterpriseType": "Small",
            "MajorActivity": "Manufacturing",
            "NIC5DigitCode": "21001",
            "WhetherProdCommenced": "YES",
            "RegistrationDate": "2020-12-10",
            "social_category": "General",
            "contact_phone": "+91 484 456 7890",
            "contact_email": "contact@ayurvedicwellness.in"
        },
        {
            "EnterpriseName": "Natural Beauty Cosmetics",
            "District": "HYDERABAD",
            "State": "TELANGANA",
            "EnterpriseType": "Micro",
            "MajorActivity": "Manufacturing",
            "NIC5DigitCode": "20423",
            "WhetherProdCommenced": "YES",
            "RegistrationDate": "2023-03-15",
            "social_category": "General",
            "contact_phone": "+91 40 2345 6789",
            "contact_email": "sales@naturalbeauty.co.in"
        }
    ]
}
