import * as React from "react";
import { AppContext } from "../common/functions";
import config from "../../configurationManager";
import { useLocation } from "react-router";
import type { Location } from "history";
import { vipfyAdmins, vipfyVacationAdmins } from "../common/constants";
import { useQuery } from "@apollo/client/react/hooks";
import { me } from "../queries/auth";
import type { AppContextContent, MoveToType } from "../interfaces";

interface Props {
    sidebarOpen: boolean;
    moveTo: MoveToType;
    location: Location;
}

interface InnerProps extends Props {
    unitid: string;
    companyid: string;
    isAdmin: boolean;
    addRenderElement: AppContextContent["addRenderElement"];
}

interface Link {
    label: string;
    location: string;
    icon: string;
    show: boolean;
    highlight: string;
}

type Categories = { [key: string]: Link[] };

const calculateCategories = (unitid: string, companyid: string, isAdmin: boolean): Categories => {
    return {
        PROFILE: [
            {
                label: "Company Profile",
                location: "company",
                icon: "building",
                show: isAdmin,
                highlight: "companyprofile"
            }
        ],
        MANAGEMENT: [
            {
                label: "Team Manager",
                location: "dmanager",
                icon: "user-tag",
                show: isAdmin,
                highlight: "dmanager"
            },
            {
                label: "Employee Manager",
                location: "emanager",
                icon: "users-cog",
                show: isAdmin,
                highlight: "emanager"
            },
            {
                label: "Service Manager",
                location: "lmanager",
                icon: "credit-card-blank",
                show: isAdmin,
                highlight: "lmanager"
            }
        ],
        BILLING: [
            {
                label: "Billing Information",
                location: "billing",
                icon: "file-invoice-dollar",
                show: isAdmin && config.showBilling,
                highlight: "billingelement"
            },
            {
                label: "Billing History",
                location: "billing",
                icon: "file-invoice-dollar",
                show: isAdmin && config.showBilling,
                highlight: "billingelement"
            },
            {
                label: "Payment Method",
                location: "paymentdata",
                icon: "file-invoice-dollar",
                show: isAdmin && config.showBilling,
                highlight: "billingelement"
            }
        ],
        STATISTICS: [
            {
                label: "Billing Statistics",
                location: "billing",
                icon: "file-invoice-dollar",
                show: isAdmin && config.showBilling,
                highlight: "billingelement"
            },
            {
                label: "Usage Statistics",
                location: "usage",
                icon: "chart-line",
                show: isAdmin,
                highlight: "usage"
            }
        ],
        SECURITY: [
            {
                label: "Overview",
                location: "security",
                icon: "user-shield",
                show: isAdmin,
                highlight: "securityelement"
            }
        ],
        "VIPFY ADMIN": [
            {
                label: "Tools",
                location: "admin",
                icon: "layer-plus",
                show: config.showAdmin && vipfyAdmins.some(admin => admin == unitid),
                highlight: "adminelement"
            },
            {
                label: "Vacation Requests",
                location: "vacation",
                icon: "umbrella-beach",
                show:
                    config.showVacationRequests && vipfyVacationAdmins.some(admin => admin == unitid),
                highlight: "vacation"
            },
            {
                label: "SSO Configurator",
                location: "ssoconfig",
                icon: "dice-d12",
                show: isAdmin && config.showSsoConfig && companyid == 14,
                highlight: "ssoconfig"
            },
            {
                label: "SSO Tester",
                location: "ssotest",
                icon: "dragon",
                show: false,
                highlight: "ssotest"
            },
            {
                label: "Marketplace",
                location: "marketplace",
                show: config.showMarketplace,
                highlight: "marketplace",
                icon: "store"
            },
            {
                label: "Market Categories",
                location: "marketplace/categories",
                show: config.showMarketplace,
                highlight: "marketplace",
                icon: "store"
            }
        ]
    }
};

const renderCategories = (categories: Categories, category: string, addRenderElement: AppContextContent["addRenderElement"], currentLocation: Location, moveTo: MoveToType) => (
    <li key={category}>
        <div className={"adminHeadline-categoryTitle"}>{category}</div>
        {categories[category].map(({ label, location, highlight, ...categoryProps }) => {
            let buttonClass = "naked-button adminHeadline-categoryElement";

            const id = label.toString() + location.toString();

            if (
                currentLocation.pathname.startsWith(`/area/${location}`) ||
                `${currentLocation.pathname}/dashboard`.startsWith(`/area/${location}`)
            ) {
                buttonClass += " selected";
            }

            return (
                <button
                    ref={element => addRenderElement({ key: highlight, element })}
                    key={label}
                    id={id}
                    className={buttonClass}
                    onMouseDown={() => {
                        document.getElementById(id).className =
                            "naked-button adminHeadline-categoryElement active";
                    }}
                    onMouseUp={() => {
                        document.getElementById(id).className = buttonClass;
                        moveTo(location);
                    }}
                    onMouseLeave={() => {
                        document.getElementById(id).className = buttonClass;
                    }}>
                    <div className="label">{label}</div>
                </button>
            );
        })}
    </li>
);

const AdminSidebarInner: React.FC<InnerProps> = React.memo((props) => {
    const categoryList = calculateCategories(props.unitid, props.companyid, props.isAdmin);
    return (
        <div
            className={`sidebar-adminpanel${
                props.sidebarOpen ? "" : " small"
                }`}
            ref={element =>
                props.addRenderElement({
                    key: "adminSideBar",
                    element
                })
            }>
            <div className="adminHeadline">ADMIN PANEL</div>
            <ul>
                {Object.keys(categoryList).map(category =>
                    renderCategories(
                        categoryList,
                        category,
                        props.addRenderElement,
                        props.location,
                        props.moveTo
                    )
                )}
            </ul>
        </div>
    )
});

const AdminSidebar: React.FC<Props> = (props) => {
    const { loading, error, data } = useQuery(me);
    let location = useLocation();

    if (loading || error || !data || !data.me || !data.me.company || !data.me.company.unit) {
        return null;    // this should never happen. app.tsx makes the same query and this data should come straight from cache
    }

    return (
        <AppContext.Consumer>
            {context => (
                <AdminSidebarInner
                    // explicitly list props to prevent rerenders from junk we don't use
                    sidebarOpen={props.sidebarOpen}
                    moveTo={props.moveTo}
                    location={location}
                    unitid={data.me.id}
                    companyid={data.me.company.unit.id}
                    isAdmin={data.me.isadmin}
                    addRenderElement={context.addRenderElement} />
            )}
        </AppContext.Consumer>
    )
}

export default AdminSidebar;
