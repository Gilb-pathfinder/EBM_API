export enum EbmYesOrNo {
  Yes = 'Y',
  No = 'N',
}

export enum EbmReceiptType {
  Purchase = 'P',
  Sale = 'S',
  Refund = 'R'
}

export enum EbmTransactionType {
  Copy = 'C', // Sales and purchase type: Copy
  Normal = 'N', // Sales and purchase type: Normal
  Proforma = 'P', // Sales and purchase type: Proforma (Proforma invoice)
  Training = 'T', // Sales and purchase type: Training
}

export enum EbmReceiptLabel {
  NORMAL_SALES = 'NS', // Normal Sales
  NORMAL_REFUND = 'NR', // Normal Refund
  COPY_SALES = 'CS', // Copy Sales
  COPY_REFUND = 'CR', // Copy Refund
  TRAINING_SALES = 'TS', // Training Sales
  TRAINING_REFUND = 'TR', // Training Refund
  PROFORMA_SALES = 'PS', // Proforma Sales
}

export enum EbmPaymentMethod {
  CASH = '01', // Cash
  CREDIT = '02', // Credit
  CASH_CREDIT = '03', // Cash/Credit
  BANK_CHECK = '04', // Bank check payment
  DEBIT_CREDIT_CARD = '05', // Debit & Credit Card payment
  MOBILE_MONEY = '06', // Mobile Money
  OTHER = '07', // Other means of payment
}

export enum EbmImportItemStatus {
  Unsent = '1',
  Waiting = '2',
  Approved = '3',
  Cancelled = '4',
}

export enum EbmRefundReasonCode {
  MissingQuantity = '01',
  MissingItem = '02',
  Damaged = '03',
  Wasted = '04',
  RawMaterialShortage = '05',
  Refund = '06',
  WrongCustomerTIN = '07',
  WrongCustomerName = '08',
  WrongAmountPrice = '09',
  WrongQuantity = '10',
  WrongItems = '11',
  WrongTaxType = '12',
  OtherReason = '13',
}

export enum EbmStockInOutType {
  IncomingImport = '01',
  IncomingPurchase = '02',
  IncomingReturn = '03',
  IncomingStockMovement = '04',
  IncomingProcessing = '05',
  IncomingAdjustment = '06',
  OutgoingSale = '11',
  OutgoingReturn = '12',
  OutgoingStockMovement = '13',
  OutgoingProcessing = '14',
  OutgoingDiscarding = '15',
  OutgoingAdjustment = '16',
}

export enum EbmApiResponseCode {
  InvoiceNumberAlreadyExists = '924',
  // Server-related response codes
  ServerSucceeded = '000', // The operation was successful
  NoSearchResult = '001', // No search result found

  // Client-related error response codes
  ClientPurchaseMandatory = '881', // Purchase is mandatory
  ClientPurchaseCodeInvalid = '882', // The provided purchase code is invalid
  ClientPurchaseAlreadyUsed = '883', // The purchase code has already been used
  ClientInvalidCustomerTIN = '884', // Invalid customer TIN provided
  ClientErrorCreatingRequestURL = '891', // Error occurred while creating the request URL
  ClientErrorCreatingRequestHeader = '892', // Error occurred while creating the request header
  ClientErrorCreatingRequestBody = '893', // Error occurred while creating the request body
  ClientErrorServerCommunication = '894', // Error occurred in server communication
  ClientErrorUnallowedRequestMethod = '895', // The request method is not allowed
  ClientErrorRequestStatus = '896', // An error occurred with the request status
  ClientErrorClient = '899', // A general client-related error occurred

  // Server-related error response codes
  ServerNoHeaderInformation = '900', // No header information provided
  ServerInvalidDevice = '901', // The device is not valid
  ServerDeviceInstalled = '902', // The device is already installed
  ServerOnlyVSDCDeviceCanBeVerified = '903', // Only VSDC devices can be verified

  // Request parameter and method-related errors
  ServerRequestParameterError = '910', // Invalid or missing request parameters
  ServerNoRequestFullText = '911', // No full text found in the request
  ServerRequestMethodError = '912', // There was an error with the request method

  // Sales and invoice-related errors
  ServerSalesDataNotReceived = '921', // Sales data cannot be received before sales invoices
  ServerSalesInvoiceDataReceivedAfterSales = '922', // Sales invoice data can only be received after sales data

  // Server operation errors
  ServerMaxViewsExceeded = '990', // Maximum number of views has been exceeded
  ServerRegistrationError = '991', // Error occurred during registration
  ServerModificationError = '992', // Error occurred during modification
  ServerDeletionError = '993', // Error occurred during deletion
  ServerOverlappedData = '994', // Data overlap error occurred
  ServerNoDownloadedFile = '995', // No file was downloaded
  ServerUnknownError = '999', // An unknown error occurred, please contact the administrator
}

export enum EbmTransactionProgress {
  WaitForApproval = '01', // Wait for Approval
  Approved = '02', // Approved
  CancelRequested = '03', // Cancel Requested
  Canceled = '04', // Canceled
  Refunded = '05', // Refunded
  Transferred = '06', // Transferred
}

export enum EbmRegistrationType {
  Automatic = 'A', // Automatic Registration
  Manual = 'M', // Manual Registration
}

// Unit of Quantity Enum
export enum EbmUnitOfQuantity {
  Kilogram = 'KGM',
  Pair = '4B', // Pair
  Cap = 'AV', // Cap
  Barrel = 'BA', // Barrel
  Bundle = 'BE', // Bundle
  Bag = 'BG', // Bag
  Block = 'BL', // Block
  BLLBarrel = 'BLL', // BLL Barrel (petroleum) (158,987 dm3)
  Box = 'BX', // Box
  Can = 'CA', // Can
  Cell = 'CEL', // Cell
  Centimetre = 'CMT', // Centimetre
  Carat = 'CR', // Carat
  Drum = 'DR', // Drum
  Dozen = 'DZ', // Dozen
  Gallon = 'GLL', // Gallon
  Gram = 'GRM', // Gram
  Gross = 'GRO', // Gross
  KiloGramme = 'KG', // Kilo-Gramme
  Kilometre = 'KTM', // Kilometre
  Kilowatt = 'KWT', // Kilowatt
  Litre = 'L', // Litre
  Pound = 'LBR', // Pound
  Link = 'LK', // Link
  LitreAgain = 'LTR', // Litre (Repeated code name, could be clarified)
  Metre = 'M', // Metre
  SquareMetre = 'M2', // Square Metre
  CubicMetre = 'M3', // Cubic Metre
  Milligram = 'MGM', // Milligram
  Meter = 'MTR', // Meter
  MegawattHour = 'MWT', // Megawatt hour (1000 kW.h)
  Number = 'NO', // Number
  PartPerThousand = 'NX', // Part per thousand
  Packet = 'PA', // Packet
  Plate = 'PG', // Plate
  PairAgain = 'PR', // Pair (Repeated code name, could be clarified)
  Reel = 'RL', // Reel
  Roll = 'RO', // Roll
  Set = 'SET', // Set
  Sheet = 'ST', // Sheet
  TonneMetricTon = 'TNE', // Tonne (metric ton)
  Tube = 'TU', // Tube
  PiecesItem = 'U', // Pieces/item (Number)
  Yard = 'YRD', // Yard
}

// Packaging Unit Enum
export enum EbmPackagingUnit {
  Ampoule = 'AM', // Ampoule
  Barrel = 'BA', // Barrel
  Bottlecrate = 'BC', // Bottlecrate
  Bundle = 'BE', // Bundle
  BalloonNonProtected = 'BF', // Balloon, non-protected
  Bag = 'BG', // Bag
  Bucket = 'BJ', // Bucket
  Basket = 'BK', // Basket
  Bale = 'BL', // Bale
  BottleProtectedCylindrical = 'BQ', // Bottle, protected cylindrical
  Bar = 'BR', // Bar
  BottleBulbous = 'BV', // Bottle, bulbous
  BagAgain = 'BZ', // Bag (Repeated code name, could be clarified)
  Can = 'CA', // Can
  Chest = 'CH', // Chest
  Coffin = 'CJ', // Coffin
  Coil = 'CL', // Coil
  WoodenBox = 'CR', // Wooden Box, Wooden Case
  Cassette = 'CS', // Cassette
  Carton = 'CT', // Carton
  Container = 'CTN', // Container
  Cylinder = 'CY', // Cylinder
  ExtraCountableItem = 'GT', // Extra Countable Item
  HandBaggage = 'HH', // Hand Baggage
  Ingots = 'IZ', // Ingots
  Jar = 'JR', // Jar
  Jug = 'JU', // Jug
  JerryCanCylindrical = 'JY', // Jerry CAN Cylindrical
  Canester = 'KZ', // Canester
  LogsInBundle = 'LZ', // Logs, in bundle/bunch/truss
  Net = 'NT', // Net
  NonExteriorPackagingUnit = 'OU', // Non-Exterior Packaging Unit
  Poddon = 'PD', // Poddon
  Plate = 'PG', // Plate
  Pipe = 'PI', // Pipe
  Pilot = 'PO', // Pilot
  Traypack = 'PU', // Traypack
  Reel = 'RL', // Reel
  Roll = 'RO', // Roll
  RodsInBundle = 'RZ', // Rods, in bundle/bunch/truss
  Skeletoncase = 'SK', // Skeletoncase
  TankCylindrical = 'TY', // Tank, cylindrical
  BulkGasAt1031mbar15C = 'VG', // Bulk, gas (at 1031 mbar 15°C)
  BulkLiquidAtNormalTemperature = 'VL', // Bulk, liquid (at normal temperature/pressure)
  BulkSolidLargeParticles = 'VO', // Bulk, solid, large particles ("nodules")
  BulkGasLiquefiedAbnormalTemp = 'VQ', // Bulk, gas (liquefied at abnormal temperature/pressure)
  BulkSolidGranularParticles = 'VR', // Bulk, solid, granular particles ("grains")
  ExtraBulkItem = 'VT', // Extra Bulk Item
  BulkFineParticles = 'VY', // Bulk, fine particles ("powder")
  MillsCigarette = 'ML', // Mills cigarette
  TAN1TAN = 'TN', // TAN 1TAN REFER TO 20BAGS
}

// Taxpayer Status Enum
export enum EbmTaxpayerStatus {
  Active = 'A', // Active
  Discard = 'D', // Discard
}

export enum EbmProductType {
  RawMaterial = '1',     // Raw Material
  FinishedProduct = '2', // Finished Product
  Service = '3',         // Service — no stock check
  Composed = '4',        // Composed/Bundle — stock deducted from components, not this item
}

export enum EbmCountryCode {
  // Africa
  Algeria = 'DZ', // ALGERIA
  Angola = 'AO', // ANGOLA
  Benin = 'BJ', // BENIN
  Botswana = 'BW', // BOTSWANA
  BurkinaFaso = 'BF', // BURKINA FASO
  Burundi = 'BI', // BURUNDI
  Cameroon = 'CM', // CAMEROON
  CapeVerde = 'CV', // CAPE VERDE
  CentralAfricanRepublic = 'CF', // CENTRAL AFRICAN REPUBLIC
  Chad = 'TD', // CHAD
  Comoros = 'KM', // COMOROS
  Congo = 'CG', // CONGO
  DemocraticRepublicOfCongo = 'CD', // DEMOCRATIC REPUBLIC OF CONGO
  Djibouti = 'DJ', // DJIBOUTI
  Egypt = 'EG', // EGYPT
  EquatorialGuinea = 'GQ', // EQUATORIAL GUINEA
  Eritrea = 'ER', // ERITREA
  Eswatini = 'SZ', // ESWATINI (Note: Your provided list has 'SWAZILAND' for SZ, which is the former name)
  Ethiopia = 'ET', // ETHIOPIA
  Gabon = 'GA', // GABON
  Gambia = 'GM', // GAMBIA
  Ghana = 'GH', // GHANA
  Guinea = 'GN', // GUINEA
  GuineaBissau = 'GW', // GUINEA-BISSAU
  IvoryCoast = 'CI', // IVORY COAST (Note: Your provided list has 'COTE D'IVOIRE (IVORY COAST)' for CI)
  Kenya = 'KE', // KENYA
  Lesotho = 'LS', // LESOTHO
  Liberia = 'LR', // LIBERIA
  Libya = 'LY', // LIBYA
  Madagascar = 'MG', // MADAGASCAR
  Malawi = 'MW', // MALAWI
  Mali = 'ML', // MALI
  Mauritania = 'MR', // MAURITANIA
  Mauritius = 'MU', // MAURITIUS
  Morocco = 'MA', // MOROCCO
  Mozambique = 'MZ', // MOZAMBIQUE
  Namibia = 'NA', // NAMIBIA
  Niger = 'NE', // NIGER
  Nigeria = 'NG', // NIGERIA
  Rwanda = 'RW', // RWANDA
  SaoTomeAndPrincipe = 'ST', // SÃO TOMÉ AND PRÍNCIPE
  Senegal = 'SN', // SENEGAL
  Seychelles = 'SC', // SEYCHELLES
  SierraLeone = 'SL', // SIERRA LEONE
  Somalia = 'SO', // SOMALIA
  SouthAfrica = 'ZA', // SOUTH AFRICA
  Sudan = 'SD', // SUDAN
  Tanzania = 'TZ', // TANZANIA
  Togo = 'TG', // TOGO
  Tunisia = 'TN', // TUNISIA
  Uganda = 'UG', // UGANDA
  Zambia = 'ZM', // ZAMBIA
  Zimbabwe = 'ZW', // ZIMBABWE

  // Asia
  Azerbaijan = 'AZ', // AZERBAIJAN
  Bahrain = 'BH', // BAHRAIN
  Bangladesh = 'BD', // BANGLADESH
  Bhutan = 'BT', // BHUTAN
  Brunei = 'BN', // BRUNEI
  Cambodia = 'KH', // CAMBODIA
  China = 'CN', // CHINA
  India = 'IN', // INDIA
  Indonesia = 'ID', // INDONESIA
  Iran = 'IR', // IRAN
  Iraq = 'IQ', // IRAQ
  Israel = 'IL', // ISRAEL
  Japan = 'JP', // JAPAN
  Jordan = 'JO', // JORDAN
  Kuwait = 'KW', // KUWAIT
  Kyrgyzstan = 'KG', // KYRGYZSTAN
  Laos = 'LA', // LAOS
  Lebanon = 'LB', // LEBANON
  Malaysia = 'MY', // MALAYSIA
  Maldives = 'MV', // MALDIVES
  Mongolia = 'MN', // MONGOLIA
  Myanmar = 'MM', // MYANMAR
  Nepal = 'NP', // NEPAL
  NorthKorea = 'KP', // NORTH KOREA
  Oman = 'OM', // OMAN
  Pakistan = 'PK', // PAKISTAN
  Palestine = 'PS', // PALESTINE (Note: Your provided list has 'PALESTINIAN TERRITORY, OCCUPIED' for PS)
  Philippines = 'PH', // PHILIPPINES
  Qatar = 'QA', // QATAR
  SaudiArabia = 'SA', // SAUDI ARABIA
  Singapore = 'SG', // SINGAPORE
  SouthKorea = 'KR', // SOUTH KOREA
  SriLanka = 'LK', // SRI LANKA
  Syria = 'SY', // SYRIA
  Taiwan = 'TW', // TAIWAN
  Tajikistan = 'TJ', // TAJIKISTAN
  Thailand = 'TH', // THAILAND
  TimorLeste = 'TL', // TIMOR-LESTE (Note: Your provided list has 'EAST TIMOR' for TP, but TL is the current standard)
  Turkey = 'TR', // TURKEY
  Turkmenistan = 'TM', // TURKMENISTAN
  UnitedArabEmirates = 'AE', // UNITED ARAB EMIRATES
  Uzbekistan = 'UZ', // UZBEKISTAN
  Yemen = 'YE', // YEMEN

  // Europe
  Albania = 'AL', // ALBANIA
  Andorra = 'AD', // ANDORRA
  Armenia = 'AM', // ARMENIA
  Austria = 'AT', // AUSTRIA
  Belarus = 'BY', // BELARUS
  Belgium = 'BE', // BELGIUM
  BosniaHerzegovina = 'BA', // BOSNIA & HERZEGOVINA
  Bulgaria = 'BG', // BULGARIA
  Croatia = 'HR', // CROATIA
  Cyprus = 'CY', // CYPRUS
  CzechRepublic = 'CZ', // CZECH REPUBLIC
  Denmark = 'DK', // DENMARK
  Estonia = 'EE', // ESTONIA
  Finland = 'FI', // FINLAND
  France = 'FR', // FRANCE
  Georgia = 'GE', // GEORGIA
  Germany = 'DE', // GERMANY
  Greece = 'GR', // GREECE
  Hungary = 'HU', // HUNGARY
  Iceland = 'IS', // ICELAND
  Ireland = 'IE', // IRELAND
  Italy = 'IT', // ITALY
  Kazakhstan = 'KZ', // KAZAKHSTAN
  Latvia = 'LV', // LATVIA
  Liechtenstein = 'LI', // LIECHTENSTEIN
  Lithuania = 'LT', // LITHUANIA
  Luxembourg = 'LU', // LUXEMBOURG
  Malta = 'MT', // MALTA
  Moldova = 'MD', // MOLDOVA
  Monaco = 'MC', // MONACO
  Montenegro = 'ME', // MONTENEGRO
  Netherlands = 'NL', // NETHERLANDS
  NorthMacedonia = 'MK', // NORTH MACEDONIA (Note: Your provided list has 'F.Y.R.O.M. (MACEDONIA)' for MK)
  Norway = 'NO', // NORWAY
  Poland = 'PL', // POLAND
  Portugal = 'PT', // PORTUGAL
  Romania = 'RO', // ROMANIA
  Russia = 'RU', // RUSSIA (Note: Your provided list has 'RUSSIAN FEDERATION' for RU)
  SanMarino = 'SM', // SAN MARINO
  Serbia = 'RS', // SERBIA
  Slovakia = 'SK', // SLOVAKIA (Note: Your provided list has 'SLOVAK REPUBLIC' for SK)
  Slovenia = 'SI', // SLOVENIA
  Spain = 'ES', // SPAIN
  Sweden = 'SE', // SWEDEN
  Switzerland = 'CH', // SWITZERLAND
  Ukraine = 'UA', // UKRAINE
  UnitedKingdom = 'GB', // UNITED KINGDOM (Note: Your provided list has 'GREAT BRITAIN (UK)' for GB)

  // North America
  AntiguaAndBarbuda = 'AG', // ANTIGUA AND BARBUDA
  Bahamas = 'BS', // BAHAMAS
  Barbados = 'BB', // BARBADOS
  Belize = 'BZ', // BELIZE
  Canada = 'CA', // CANADA
  CostaRica = 'CR', // COSTA RICA
  Cuba = 'CU', // CUBA
  Dominica = 'DM', // DOMINICA
  DominicanRepublic = 'DO', // DOMINICAN REPUBLIC
  ElSalvador = 'SV', // EL SALVADOR
  Grenada = 'GD', // GRENADA
  Guatemala = 'GT', // GUATEMALA
  Haiti = 'HT', // HAITI
  Honduras = 'HN', // HONDURAS
  Jamaica = 'JM', // JAMAICA
  Mexico = 'MX', // MEXICO
  Nicaragua = 'NI', // NICARAGUA
  Panama = 'PA', // PANAMA
  SaintKittsAndNevis = 'KN', // SAINT KITTS AND NEVIS
  SaintLucia = 'LC', // SAINT LUCIA
  SaintVincentAndGrenadines = 'VC', // SAINT VINCENT AND THE GRENADINES
  TrinidadAndTobago = 'TT', // TRINIDAD AND TOBAGO
  UnitedStates = 'US', // UNITED STATES

  // Oceania
  Australia = 'AU', // AUSTRALIA
  Fiji = 'FJ', // FIJI
  Kiribati = 'KI', // KIRIBATI
  MarshallIslands = 'MH', // MARSHALL ISLANDS
  Micronesia = 'FM', // MICRONESIA
  Nauru = 'NR', // NAURU
  NewZealand = 'NZ', // NEW ZEALAND
  Palau = 'PW', // PALAU
  PapuaNewGuinea = 'PG', // PAPUA NEW GUINEA
  Samoa = 'WS', // SAMOA
  SolomonIslands = 'SB', // SOLOMON ISLANDS
  Tonga = 'TO', // TONGA
  Tuvalu = 'TV', // TUVALU
  Vanuatu = 'VU', // VANUATU

  // South America
  Argentina = 'AR', // ARGENTINA
  Bolivia = 'BO', // BOLIVIA
  Brazil = 'BR', // BRAZIL
  Chile = 'CL', // CHILE
  Colombia = 'CO', // COLOMBIA
  Ecuador = 'EC', // ECUADOR
  Guyana = 'GY', // GUYANA
  Paraguay = 'PY', // PARAGUAY
  Peru = 'PE', // PERU
  Suriname = 'SR', // SURINAME
  Uruguay = 'UY', // URUGUAY
  Venezuela = 'VE', // VENEZUELA
}

export interface EbmDefaultResponse {
  resultCd: EbmApiResponseCode
  resultMsg: string
  resultDt: string
}

export enum EbmTaxType {
  A = 'A', //A-EX
  B = 'B', //B-18.00%
  C = 'C', //
  D = 'D', //
}

export enum EbmCurrencyCode {
  UNITED_ARAB_EMIRATES_DIRHAM = "AED",
  AFGHAN_AFGHANI = "AFN",
  ALBANIAN_LEK = "ALL",
  ARMENIAN_DRAM = "AMD",
  NETHERLANDS_ANTILLEAN_GUILDER = "ANG",
  ANGOLAN_KWANZA = "AOA",
  ARGENTINE_PESO = "ARS",
  AUSTRALIAN_DOLLAR = "AUD",
  ARUBAN_FLORIN = "AWG",
  AZERBAIJANI_MANAT = "AZN",
  BOSNIA_AND_HERZEGOVINA_CONVERTIBLE_MARK = "BAM",
  BARBADOS_DOLLAR = "BBD",
  BANGLADESHI_TAKA = "BDT",
  BULGARIAN_LEV = "BGN",
  BAHRAINI_DINAR = "BHD",
  BURUNDIAN_FRANC = "BIF",
  BERMUDIAN_DOLLAR = "BMD",
  BRUNEI_DOLLAR = "BND",
  BOLIVIANO = "BOB",
  BOLIVIAN_MVDOL = "BOV",
  BRAZILIAN_REAL = "BRL",
  BAHAMIAN_DOLLAR = "BSD",
  BHUTANESE_NGULTRUM = "BTN",
  BOTSWANA_PULA = "BWP",
  NEW_BELARUSIAN_RUBLE = "BYN",
  BELARUSIAN_RUBLE = "BYR",
  BELIZE_DOLLAR = "BZD",
  CANADIAN_DOLLAR = "CAD",
  CONGOLESE_FRANC = "CDF",
  WIR_EURO = "CHE",
  SWISS_FRANC = "CHF",
  WIR_FRANC = "CHW",
  UNIDAD_DE_FOMENTO = "CLF",
  CHILEAN_PESO = "CLP",
  CHINESE_YUAN = "CNY",
  COLOMBIAN_PESO = "COP",
  UNIDAD_DE_VALOR_REAL = "COU",
  COSTA_RICAN_COLON = "CRC",
  CUBAN_CONVERTIBLE_PESO = "CUC",
  CUBAN_PESO = "CUP",
  CAPE_VERDE_ESCUDE = "CVE",
  CZECH_KORUNA = "CZK",
  DJIBOUTIAN_FRANC = "DJF",
  DANISH_KRONE = "DKK",
  DOMINICAN_PESO = "DOP",
  ALGERIAN_DINAR = "DZD",
  EGYPTIAN_POUND = "EGP",
  ERITREAN_NAKFA = "ERN",
  ETHIOPIAN_BIRR = "ETB",
  EURO = "EUR",
  FIJI_DOLLAR = "FJD",
  FALKLAND_ISLANDS_POUND = "FKP",
  POUND_STERLING = "GBP",
  GEORGIAN_LARI = "GEL",
  GHANAIAN_CEDI = "GHS",
  GIBRALTAR_POUND = "GIP",
  GAMBIAN_DALASI = "GMD",
  GUINEAN_FRANC = "GNF",
  GUATEMALAN_QUETZAL = "GTQ",
  GUYANESE_DOLLAR = "GYD",
  HONG_KONG_DOLLAR = "HKD",
  HONDURAN_LEMPIRA = "HNL",
  CROATIAN_KUNA = "HRK",
  HAITIAN_GOURDE = "HTG",
  HUNGARIAN_FORINT = "HUF",
  INDONESIAN_RUPIAH = "IDR",
  ISRAELI_NEW_SHEKEL = "ILS",
  INDIAN_RUPEE = "INR",
  IRAQI_DINAR = "IQD",
  IRANIAN_RIAL = "IRR",
  ICELANDIC_KRONA = "ISK",
  JAMAICAN_DOLLAR = "JMD",
  JORDANIAN_DINAR = "JOD",
  JAPANESE_YEN = "JPY",
  KENYAN_SHILLING = "KES",
  KYRGYZSTANI_SOM = "KGS",
  CAMBODIAN_RIEL = "KHR",
  COMORO_FRANC = "KMF",
  NORTH_KOREAN_WON = "KPW",
  SOUTH_KOREAN_WON = "KRW",
  KUWAITI_DINAR = "KWD",
  CAYMAN_ISLANDS_DOLLAR = "KYD",
  KAZAKHSTANI_TENGE = "KZT",
  LAO_KIP = "LAK",
  LEBANESE_POUND = "LBP",
  SRI_LANKAN_RUPEE = "LKR",
  LIBERIAN_DOLLAR = "LRD",
  LESOTHO_LOTI = "LSL",
  LIBYAN_DINAR = "LYD",
  MOROCCAN_DIRHAM = "MAD",
  MOLDOVAN_LEU = "MDL",
  MALAGASY_ARIARY = "MGA",
  MACEDONIAN_DENAR = "MKD",
  MYANMAR_KYAT = "MMK",
  MONGOLIAN_TOGROG = "MNT",
  MACANESE_PATACA = "MOP",
  MAURITANIAN_OUGUIYA = "MRO",
  MAURITIAN_RUPEE = "MUR",
  MALDIVIAN_RUFIYAA = "MVR",
  MALAWIAN_KWACHA = "MWK",
  MEXICAN_PESO = "MXN",
  MEXICAN_UNIDAD_DE_INVERSION_UDI = "MXV",
  MALAYSIAN_RINGGIT = "MYR",
  MOZAMBICAN_METICAL = "MZN",
  NAMIBIAN_DOLLAR = "NAD",
  NIGERIAN_NAIRA = "NGN",
  NICARAGUAN_CORDOBA = "NIO",
  NORWEGIAN_KRONE = "NOK",
  NEPALESE_RUPEE = "NPR",
  NEW_ZEALAND_DOLLAR = "NZD",
  OMANI_RIAL = "OMR",
  PANAMANIAN_BALBOA = "PAB",
  PERUVIAN_SOL = "PEN",
  PAPUA_NEW_GUINEAN_KINA = "PGK",
  PHILIPPINE_PESO = "PHP",
  PAKISTANI_RUPEE = "PKR",
  POLISH_ZLOTY = "PLN",
  PARAGUAYAN_GUARANI = "PYG",
  QATARI_RIYAL = "QAR",
  ROMANIAN_LEU = "RON",
  SERBIAN_DINAR = "RSD",
  RUSSIAN_RUBLE = "RUB",
  RWANDAN_FRANC = "RWF",
  SAUDI_RIYAL = "SAR",
  SOLOMON_ISLANDS_DOLLAR = "SBD",
  SEYCHELLES_RUPEE = "SCR",
  SUDANESE_POUND = "SDG",
  SWEDISH_KRONA_KRONOR = "SEK",
  SINGAPORE_DOLLAR = "SGD",
  SAINT_HELENA_POUND = "SHP",
  SIERRA_LEONEAN_LEONE = "SLL",
  SOMALI_SHILLING = "SOS",
  SURINAMESE_DOLLAR = "SRD",
  SOUTH_SUDANESE_POUND = "SSP",
  SAO_TOME_AND_PRINCIPE_DOBRA = "STD",
  SALVADORAN_COLON = "SVC",
  SYRIAN_POUND = "SYP",
  SWAZI_LILANGENI = "SZL",
  THAI_BAHT = "THB",
  TAJIKISTANI_SOMONI = "TJS",
  TURKMENISTANI_MANAT = "TMT",
  TUNISIAN_DINAR = "TND",
  TONGAN_PAANGA = "TOP",
  TURKISH_LIRA = "TRY",
  TRINIDAD_AND_TOBAGO_DOLLAR = "TTD",
  NEW_TAIWAN_DOLLAR = "TWD",
  TANZANIAN_SHILLING = "TZS",
  UKRAINIAN_HRYVNIA = "UAH",
  UGANDAN_SHILLING = "UGX",
  UNITED_STATES_DOLLAR = "USD",
  UNITED_STATES_DOLLAR_NEXT_DAY = "USN",
  URUGUAY_PESO_EN_UNIDADES_INDEXADAS = "UYI",
  URUGUAYAN_PESO = "UYU",
  UZBEKISTAN_SOM = "UZS",
  VENEZUELAN_BOLIVAR = "VEF",
  VIETNAMESE_DONG = "VND",
  VANUATU_VATU = "VUV",
  SAMOAN_TALA = "WST",
  CFA_FRANC_BEAC = "XAF",
  SILVER_ONE_TROY_OUNCE = "XAG",
  GOLD_ONE_TROY_OUNCE = "XAU",
  EUROPEAN_COMPOSITE_UNIT_EURCO = "XBA",
  EUROPEAN_MONETARY_UNIT_EMU6 = "XBB",
  EUROPEAN_UNIT_OF_ACCOUNT_9_EUA9 = "XBC",
  EUROPEAN_UNIT_OF_ACCOUNT_17_EUA17 = "XBD",
  EAST_CARIBBEAN_DOLLAR = "XCD",
  SPECIAL_DRAWING_RIGHTS = "XDR",
  CFA_FRANC_BCEAO = "XOF",
  PALLADIUM_ONE_TROY_OUNCE = "XPD",
  CFP_FRANC = "XPF",
  PLATINUM_ONE_TROY_OUNCE = "XPT",
  SUCRE = "XSU",
  CODE_RESERVED_FOR_TESTING_PURPOSES = "XTS",
  ADB_UNIT_OF_ACCOUNT = "XUA",
  NO_CURRENCY = "XXX",
  YEMENI_RIAL = "YER",
  SOUTH_AFRICAN_RAND = "ZAR",
  ZAMBIAN_KWACHA = "ZMW",
  ZIMBABWEAN_DOLLAR_A10 = "ZWL"
}

//classification code
export type EbmItemClassification = {
  itemClsCd: string
  itemClsNm: string
  itemClsLvl: number
  taxTyCd: EbmTaxType | null
  mjrTgYn: EbmYesOrNo | null
  useYn: EbmYesOrNo
}

export type EbmItemClassificationResponse = {
  data: {
    itemClsList: EbmItemClassification[]
  }
}
