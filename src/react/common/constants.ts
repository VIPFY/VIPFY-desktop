export const unitPicFolder =
  "https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/";
export const iconPicFolder = "https://storage.googleapis.com/vipfy-imagestore-01/icons/";
export const logoPicFolder = "https://storage.googleapis.com/vipfy-imagestore-01/logos/";

export const defaultPic = `${unitPicFolder}default.png`;
export const PW_MIN_LENGTH = 10;

export const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const countries = [
  { value: "AT", name: "Austria", isEU: true },
  { value: "BE", name: "Belgium", isEU: true },
  { value: "BG", name: "Bulgaria", isEU: true },
  { value: "HR", name: "Croatia", isEU: true },
  { value: "CY", name: "Cyprus", isEU: true },
  { value: "CZ", name: "Czech Republic", isEU: true },
  { value: "DK", name: "Denmark", isEU: true },
  { value: "EE", name: "Estonia", isEU: true },
  { value: "FI", name: "Finland", isEU: true },
  { value: "FR", name: "France", isEU: true },
  { value: "DE", name: "Germany", isEU: true },
  //{ value: "DE", name: "Deutschland", isEU: true },
  { value: "GR", name: "Greece", isEU: true },
  { value: "HU", name: "Hungary", isEU: true },
  { value: "IE", name: "Ireland", isEU: true },
  { value: "IT", name: "Italy", isEU: true },
  { value: "LV", name: "Latvia", isEU: true },
  { value: "LT", name: "Lithuania", isEU: true },
  { value: "LU", name: "Luxembourg", isEU: true },
  { value: "MT", name: "Malta", isEU: true },
  { value: "NL", name: "Netherlands", isEU: true },
  { value: "PL", name: "Poland", isEU: true },
  { value: "PT", name: "Portugal", isEU: true },
  { value: "RO", name: "Romania", isEU: true },
  { value: "SK", name: "Slovakia", isEU: true },
  { value: "SI", name: "Slovenia", isEU: true },
  { value: "ES", name: "Spain", isEU: true },
  { value: "SE", name: "Sweden", isEU: true },
  { value: "GB", name: "United Kingdom", isEU: true },
  { value: "US", name: "United States of America", isEU: false },
  { value: "OT", name: "Other", isEU: false }
];

export const industries = [
  { value: "11", name: "Agriculture, Forestry, Fishing and Hunting‎" },
  { value: "21", name: "Mining, Quarrying, and Oil and Gas Extraction" },
  { value: "22", name: "Utilities" },
  { value: "23", name: "Construction" },
  { value: "31-33", name: "Manufacturing" },
  { value: "42", name: "Wholesale Trade" },
  { value: "44-45", name: "Retail Trade" },
  { value: "48-49", name: "Transportation and Warehousing" },
  { value: "51", name: "Information" },
  { value: "52", name: "Finance and Insurance" },
  { value: "53", name: "Real Estate and Rental and Leasing" },
  { value: "54", name: "Professional, Scientific, and Technical Services" },
  { value: "55", name: "Management of Companies and Enterprises" },
  { value: "56", name: "Administrative and Support and Waste Management and Remediation Services" },
  { value: "61", name: "Educational Services" },
  { value: "62", name: "Health Care and Social Assistance" },
  { value: "71", name: "Arts, Entertainment, and Recreation" },
  { value: "72", name: "Accommodation and Food Services" },
  { value: "81", name: "Other Services (except Public Administration)" },
  { value: "92", name: "Public Administration" }
];

export const subIndustries = {
  "11": [
    { value: "111", title: "Crop Production" },
    { value: "112", title: "Animal Production and Aquaculture" },
    { value: "113", title: "Forestry and Logging" },
    { value: "114", title: "Fishing, Hunting and Trapping" },
    { value: "115", title: "Support Activities for Agriculture and Forestry" }
  ],
  "21": [
    { value: "211", title: "Oil and Gas Extraction" },
    { value: "212", title: "Mining (except Oil and Gas)" },
    { value: "213", title: "Support Activities for Mining" }
  ],
  "23": [
    { value: "236", title: "Construction of Buildings" },
    { value: "237", title: "Heavy and Civil Engineering Construction" },
    { value: "238", title: "Specialty Trade Contractors" }
  ],
  "31-33": [
    { value: "311", title: "Food Manufacturing" },
    { value: "312", title: "Beverage and Tobacco Product Manufacturing" },
    { value: "313", title: "Textile Mills" },
    { value: "314", title: "Textile Product Mills" },
    { value: "315", title: "Apparel Manufacturing" },
    { value: "316", title: "Leather and Allied Product Manufacturing" },
    { value: "321", title: "Wood Product Manufacturing" },
    { value: "322", title: "Paper Manufacturing" },
    { value: "323", title: "Printing and Related Support Activities" },
    { value: "324", title: "Petroleum and Coal Products Manufacturing" },
    { value: "325", title: "Chemical Manufacturing" },
    { value: "326", title: "Plastics and Rubber Products Manufacturing" },
    { value: "327", title: "Nonmetallic Mineral Product Manufacturing" },
    { value: "331", title: "Primary Metal Manufacturing" },
    { value: "332", title: "Fabricated Metal Product Manufacturing" },
    { value: "333", title: "Machinery Manufacturing" },
    { value: "334", title: "Computer and Electronic Product Manufacturing" },
    { value: "335", title: "Electrical Equipment, Appliance, and Component Manufacturing" },
    { value: "336", title: "Transportation Equipment Manufacturing" },
    { value: "337", title: "Furniture and Related Product Manufacturing" },
    { value: "339", title: "Miscellaneous Manufacturing" }
  ],
  "42": [
    { value: "423", title: "Merchant Wholesalers, Durable Goods" },
    { value: "424", title: "Merchant Wholesalers, Nondurable Goods" },
    { value: "425", title: "Wholesale Electronic Markets and Agents and Brokers" }
  ],
  "44-45": [
    { value: "441", title: "Motor Vehicle and Parts Dealers" },
    { value: "442", title: "Furniture and Home Furnishings Stores" },
    { value: "443", title: "Electronics and Appliance Stores" },
    { value: "444", title: "Building Material and Garden Equipment and Supplies Dealers" },
    { value: "445", title: "Food and Beverage Stores" },
    { value: "446", title: "Health and Personal Care Stores" },
    { value: "447", title: "Gasoline Stations" },
    { value: "448", title: "Clothing and Clothing Accessories Stores" },
    { value: "451", title: "Sporting Goods, Hobby, Musical Instrument, and Book Stores" },
    { value: "452", title: "General Merchandise Stores" },
    { value: "453", title: "Miscellaneous Store Retailers" },
    { value: "454", title: "Nonstore Retailers" }
  ],
  "48-49": [
    { value: "481", title: "Air Transportation" },
    { value: "482", title: "Rail Transportation" },
    { value: "483", title: "Water Transportation" },
    { value: "484", title: "Truck Transportation" },
    { value: "485", title: "Transit and Ground Passenger Transportation" },
    { value: "486", title: "Pipeline Transportation" },
    { value: "487", title: "Scenic and Sightseeing Transportation" },
    { value: "488", title: "Support Activities for Transportation" },
    { value: "491", title: "Postal Service" },
    { value: "492", title: "Couriers and Messengers" },
    { value: "493", title: "Warehousing and Storage" }
  ],
  "51": [
    { value: "511", title: "Publishing Industries (except Internet)" },
    { value: "512", title: "Motion Picture and Sound Recording Industries" },
    { value: "515", title: "Broadcasting (except Internet)" },
    { value: "517", title: "Telecommunications" },
    { value: "518", title: "Data Processing, Hosting, and Related Services" },
    { value: "519", title: "Other Information Services" }
  ],
  "52": [
    { value: "521", title: "Monetary Authorities-Central Bank" },
    { value: "522", title: "Credit Intermediation and Related Activities" },
    {
      value: "523",
      title:
        "Securities, Commodity Contracts, and Other Financial Investments and Related Activities"
    },
    { value: "524", title: "Insurance Carriers and Related Activities" },
    { value: "525", title: "Funds, Trusts, and Other Financial Vehicles" }
  ],
  "53": [
    { value: "531", title: "Real Estate" },
    { value: "532", title: "Rental and Leasing Services" },
    {
      value: "533",
      title: "Lessors of Nonfinancial Intangible Assets (except Copyrighted Works)"
    }
  ],
  "56": [
    { value: "561", title: "Administrative and Support Services" },
    { value: "562", title: "Waste Management and Remediation Services" }
  ],
  "62": [
    { value: "621", title: "Ambulatory Health Care Services" },
    { value: "622", title: "Hospitals" },
    { value: "623", title: "Nursing and Residential Care Facilities" },
    { value: "624", title: "Social Assistance" }
  ],
  "71": [
    { value: "711", title: "Performing Arts, Spectator Sports, and Related Industries" },
    { value: "712", title: "Museums, Historical Sites, and Similar Institutions" },
    { value: "713", title: "Amusement, Gambling, and Recreation Industries" }
  ],
  "72": [
    { value: "721", title: "Accommodation" },
    { value: "722", title: "Food Services and Drinking Places" }
  ],
  "81": [
    { value: "811", title: "Repair and Maintenance " },
    { value: "812", title: "Personal and Laundry Services" },
    {
      value: "813",
      title: "Religious, Grantmaking, Civic, Professional, and SimilarOrganizations"
    },
    { value: "814", title: "Private Households" }
  ],
  "92": [
    { value: "921", title: "Executive, Legislative, and Other General Government Support" },
    { value: "922", title: "Justice, Public Order, and Safety Activities" },
    { value: "923", title: "Administration of Human Resource Programs" },
    { value: "924", title: "Administration of Environmental Quality Programs" },
    {
      value: "925",
      title: "Administration of Housing Programs, Urban Planning, and Community Development"
    },
    { value: "926", title: "Administration of Economic Programs" },
    { value: "927", title: "Space Research and Technology" },
    { value: "928", title: "National Security and International Affairs" }
  ]
};

export const addressFields = [
  {
    type: "name",
    name: "street",
    icon: "road",
    label: "Street",
    placeholder: "Your street",
    required: true
  },
  {
    type: "name",
    name: "zip",
    icon: "sort-numeric-up",
    label: "Zip",
    placeholder: "Your zip code"
  },
  {
    type: "name",
    name: "city",
    icon: "building",
    label: "City",
    placeholder: "Your city",
    required: true
  },
  {
    type: "select",
    name: "country",
    icon: "globe",
    label: "Your country",
    options: countries,
    required: true
  },
  {
    type: "name",
    name: "description",
    icon: "archive",
    label: "Description",
    placeholder: "A short description"
  }
  // {
  //   type: "number",
  //   name: "priority",
  //   placeholder: "Select Priority",
  //   icon: "sort-numeric-up",
  //   label: "Priority"
  // }
];

export const consentText = `This awesome App uses software to offer you an amazing
experience, analyse your use of our App and provide content
from third parties. By using our App, you acknowledge that you
have read and understand our Privacy and Terms of Service and that
you consent to them.`;
