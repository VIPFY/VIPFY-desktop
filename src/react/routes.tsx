import { AppDetails, ErrorPage } from "@vipfy-private/vipfy-ui-lib";
import Billing from "./pages/billing";
import Dashboard from "./pages/dashboard";
import MarketplaceDiscover from "./pages/marketplace/MarketplaceDiscover";
import MarketplaceCategories from "./pages/marketplace/MarketplaceCategories";
import MessageCenter from "./pages/messagecenter";
import AdminDashboard from "./components/admin/Dashboard";
import ServiceCreation from "./components/admin/ServiceCreation";
import ClickTrackingStudy from "./components/admin/ClickTrackingStudy";
import UsageStatistics from "./pages/usagestatistics";
import UsageStatisticsBoughtplan from "./pages/usagestatisticsboughtplans";
import SupportPage from "./pages/support";
import Security from "./pages/security";
import Integrations from "./pages/integrations";
import ServiceEdit from "./components/admin/ServiceEdit";
import SsoConfigurator from "./pages/ssoconfigurator";
import SsoTester from "./pages/SSOtester";
import ServiceCreationExternal from "./components/admin/ServiceCreationExternal";
import ServiceLogoEdit from "./components/admin/ServiceLogoOverview";
import EmployeeOverview from "./pages/manager/employeeOverview";
import TeamDetails from "./pages/manager/teamDetails";
import UniversalLoginTest from "./components/admin/UniversalLoginTest/UniversalLoginTest";
import CompanyDetails from "./pages/manager/companyDetails";
import ServiceIntegrator from "./components/admin/ServiceIntegrator";
import CryptoDebug from "./components/admin/crytpodebug";
import Vacation from "./pages/vacation";
import EmployeeDetails from "./pages/manager/employeeDetails";
import TeamOverview from "./pages/manager/teamOverview";
import ServiceOverview from "./pages/manager/serviceOverview";
import ServiceDetails from "./pages/manager/serviceDetails";
import LoginIntegrator from "./components/admin/LoginIntegrator";
import Workspace from "./pages/Workspace";
import InboundEmails from "./components/admin/emails";
import PendingIntegrations from "./components/admin/PendingIntegrations";
import AddCustomServicePage from "./pages/addCustomService";
import Checkout from "./pages/marketplace/Checkout";
import TestingBilling from "./components/admin/testingbilling";
import PaymentMethod from "./pages/billing/paymentMethod";
import PaymentAddress from "./pages/billing/paymentAddress";
import PaymentData from "./pages/billing/paymentData";

// please add in alphabetic order
const routes = [
  { path: "/area/", component: Dashboard },
  { path: "/area/addcustomservice", component: AddCustomServicePage, greybackground: true },
  { path: "/area/admin", component: AdminDashboard, admin: true },
  { path: "/area/admin/crypto-debug", component: CryptoDebug, admin: true },
  { path: "/area/admin/email-integration/:emailid", component: LoginIntegrator, admin: true },
  { path: "/area/admin/inboundemails", component: InboundEmails, admin: true },
  { path: "/area/admin/pending-integrations", component: PendingIntegrations, admin: true },
  { path: "/area/admin/service-creation", component: ServiceCreation, admin: true },
  {
    path: "/area/admin/service-creation-external",
    component: ServiceCreationExternal,
    admin: true
  },
  { path: "/area/admin/service-edit", component: ServiceEdit, admin: true },
  { path: "/area/admin/service-integration", component: ServiceIntegrator, admin: true },
  { path: "/area/admin/service-integration/:appid", component: LoginIntegrator, admin: true },
  { path: "/area/admin/service-logo-overview", component: ServiceLogoEdit, admin: true },
  { path: "/area/admin/click-tracking-2020", component: ClickTrackingStudy, admin: true },
  { path: "/area/admin/testingbilling", component: TestingBilling, admin: true },
  { path: "/area/admin/universal-login-test", component: UniversalLoginTest, admin: true },
  { path: "/area/billing", component: Billing, admin: true },
  { path: "/area/paymentdata/paymentmethod", component: PaymentMethod, admin: true },
  { path: "/area/paymentdata/paymentaddress", component: PaymentAddress, admin: true },
  { path: "/area/paymentdata", component: PaymentData, admin: true },
  { path: "/area/company", component: CompanyDetails, admin: true },
  { path: "/area/dashboard", component: Dashboard },
  { path: "/area/dashboard/:overlay", component: Dashboard },
  { path: "/area/dmanager", component: TeamOverview, admin: true },
  { path: "/area/dmanager/:teamid", component: TeamDetails, admin: true },
  { path: "/area/emanager", component: EmployeeOverview, admin: true },
  { path: "/area/emanager/:userid", component: EmployeeDetails, admin: true },
  { path: "/area/error", component: ErrorPage },
  { path: "/area/integrations", component: Integrations },
  { path: "/area/lmanager", component: ServiceOverview, admin: true },
  { path: "/area/lmanager/:serviceid", component: ServiceDetails, admin: true },
  {
    path: "/area/manager/addcustomservice/:appname",
    component: AddCustomServicePage,
    greybackground: true,
    manager: true,
    admin: true
  },
  { path: "/area/messagecenter", component: MessageCenter },
  { path: "/area/messagecenter/:person", component: MessageCenter },
  { path: "/area/marketplace", component: MarketplaceDiscover, admin: true },
  { path: "/area/marketplace/categories", component: MarketplaceCategories, admin: true },
  { path: "/area/marketplace/categories/:appid", component: AppDetails, admin: true },
  { path: "/area/marketplace/categories/:appid/:planid", component: Checkout, admin: true },
  { path: "/area/marketplace/:appid", component: AppDetails, admin: true },
  { path: "/area/marketplace/:appid/:planid", component: Checkout, admin: true },
  { path: "/area/profile/:userid", component: EmployeeDetails, addprops: { profile: true } },
  { path: "/area/security", component: Security, admin: true },
  { path: "/area/ssoconfig", component: SsoConfigurator, admin: true },
  { path: "/area/ssotest", component: SsoTester, admin: true },
  { path: "/area/support", component: SupportPage },
  { path: "/area/usage", component: UsageStatistics, admin: true },
  {
    path: "/area/usage/boughtplan/:boughtplanid",
    component: UsageStatisticsBoughtplan,
    admin: true
  },
  { path: "/area/vacation", component: Vacation },
  { path: "/area/workspace", component: Workspace }
];

export default routes;
