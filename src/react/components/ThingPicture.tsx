import * as React from "react";
import classNames from "classnames";
import { resizeImage, getSourceSetUser, getSourceSetTeam, getSourceSetApp, getImageUrlUser, getImageUrlTeam, getImageUrlApp } from "../common/images";
import { QUERY_USER } from "../queries/user";
import { useQuery, useApolloClient } from "@apollo/client";
import { fetchTeamSmall, FETCH_COMPANY } from "../queries/departments";
import { concatName, sleep } from "../common/functions";
import { useDropzone } from "react-dropzone";
import gql from "graphql-tag";
import { me } from "../queries/auth";

export enum ThingShape {
    Square,
    Circle
}

export enum ThingType {
    User,
    Team,
    Company,
    Service
}

export enum ThingState {
    Normal = 0,
    Loading,
    Error
}

export enum ThingDesign {
    v1,
    v2
}

interface ThingProps {
    size: number;
    name: string;
    initials?: React.ReactNode;
    hideTitle?: boolean;
    type: ThingType;
    className?: string;
    shape: ThingShape;
    state?: ThingState;
    style?: React.CSSProperties;
    picture?: string;
    design?: ThingDesign;
    color?: string;
    canUpload?: boolean;
    children?: React.ReactNode;
    id?: string;
    onLoad?: () => void;
    onError?: () => void;
    onUpload?: (file: Blob) => any;
    styleModifier?: (style: React.HTMLAttributes<HTMLDivElement>) => React.HTMLAttributes<HTMLDivElement>;
}

const calculateInitials = (state: ThingState, type: ThingType, name: string): string | JSX.Element => {
    if (!name) {
        return "?";
    }
    if (state == ThingState.Loading) {
        return <i className="fas fa-spinner fa-pulse" />;
    }
    if (state == ThingState.Error) {
        return "?";
    }
    switch (type) {
        case ThingType.User: {
            let initalList = name.replace("-", " ").split(" ").map(w => Array.from(w)[0].toUpperCase()).filter(a => a !== undefined);
            if (initalList.length > 2) {
                initalList = [initalList[0], initalList[initalList.length - 1]];
            }
            return initalList.join("") || "?"
        }
        case ThingType.Team: return Array.from(name)[0] || "?";  // Array.from handles "😀" correctly
        case ThingType.Service: return Array.from(name).slice(0, 2).join("") || "?";
        case ThingType.Company: {
            let initalList = name.replace("-", " ").split(" ").map(w => Array.from(w)[0].toUpperCase()).filter(a => a !== undefined);
            initalList = initalList.slice(0, 2);
            return initalList.join("") || "?";
        }
    }
}

const getSourceSet = (type: ThingType, picture: string, size: number): string => {
    if (picture.startsWith("data:")) {
        return undefined;
    }
    switch (type) {
        case ThingType.User: return getSourceSetUser(picture, size);
        case ThingType.Team: return getSourceSetTeam(picture, size);
        case ThingType.Service: return getSourceSetApp(picture, size);
        case ThingType.Company: return getSourceSetTeam(picture, size);
    }
}

const getSrc = (type: ThingType, picture: string, size: number): string => {
    if (picture.startsWith("data:")) {
        return picture;
    }
    switch (type) {
        case ThingType.User: return getImageUrlUser(picture, size);
        case ThingType.Team: return getImageUrlTeam(picture, size);
        case ThingType.Service: return getImageUrlApp(picture, size);
        case ThingType.Company: return getImageUrlTeam(picture, size);
    }
}

const computeBackgroundStyle = (state: ThingState, type: ThingType, design: ThingDesign, picture: string, color: string, size: number): React.CSSProperties => {
    if (state == ThingState.Normal && picture) {
        return {
            backgroundColor: "unset"
        }
    }
    if (color) {
        return { backgroundColor: color }
    }
    switch (type) {
        case ThingType.User: return { backgroundColor: design == ThingDesign.v1 ? "#5d76ff" : "#B2D0FB" };
        case ThingType.Team: return { backgroundColor: design == ThingDesign.v1 ? "#9C13BC" : "#E8A2D4" };
        case ThingType.Service: return { backgroundColor: design == ThingDesign.v1 ? "#5d76ff" : "#B2D0FB" };
        case ThingType.Company: return { backgroundColor: design == ThingDesign.v1 ? "#9C13BC" : "#E8A2D4" };
    }
}

const computeImgProps = (state: ThingState, type: ThingType, design: ThingDesign, picture: string, color: string, size: number): React.ImgHTMLAttributes<HTMLImageElement> => {
    if (state != ThingState.Error && picture) {
        const additionalStyle: React.CSSProperties = {}
        if (state != ThingState.Normal) {
            additionalStyle.display = "none";
        }
        return {
            srcSet: getSourceSet(type, picture, size),
            src: getSrc(type, picture, size),
            style: {
                width: "100%", height: "100%", objectFit: picture.startsWith("data:") ? "cover" : "contain", ...additionalStyle
            }
        }
    }
    return null
}

const ThingPictureRaw: React.FC<ThingProps> = React.memo(({ size, name, initials = null, hideTitle = false, type, className = null, shape, state = ThingState.Normal, style, picture, color = null, design = ThingDesign.v1, children, onLoad = null, onError = null, styleModifier = (a) => a }) => {
    const finalSize = size || 32;
    const additionalStyle = computeBackgroundStyle(state, type, design, picture, color, size);
    initials = initials || calculateInitials(state, type, name);
    const borderRadius = size <= 32 ? "3px" : size >= 128 ? "0.5em" : "4px";
    const imageProps = computeImgProps(state, type, design, picture, color, size);
    return (
        <div
            {...styleModifier({
                title: hideTitle ? null : name,
                className: classNames(
                    className || "managerSquare",
                    { circle: shape == ThingShape.Circle }),
                style: {
                    minWidth: finalSize,
                    width: finalSize,
                    height: finalSize,
                    color: design == ThingDesign.v1 ? "white" : "#3B4C5D",
                    fontSize: shape == ThingShape.Square ? finalSize / 2 : finalSize / 3,
                    borderRadius: shape == ThingShape.Square ? borderRadius : finalSize / 2,
                    overflow: "hidden",
                    cursor: "pointer",
                    userSelect: "none",
                    ...additionalStyle,
                    ...style
                }
            })}
        >
            {imageProps && <img {...imageProps} onLoad={onLoad} onError={onError} />}
            {(!picture || state != ThingState.Normal) && <span
                style={{
                    width: finalSize,
                    height: finalSize,
                    lineHeight: finalSize + "px",
                    position: "absolute",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                {initials}
            </span>}
            {children}
        </div>
    )
});

/// similar to useState, but it always starts at false, and the setter always sets it to true
/// changing value resets the value to false
function useTrigger(value: any): [boolean, () => void] {
    const [state, setState] = React.useState(false);
    const set = React.useCallback(() => setState(true), []);
    React.useEffect(() => setState(false), [value]);
    return [state, set];
}

const ThingPictureLoadState: React.FC<ThingProps> = (props) => {
    const [isDoneLoading, setIsDoneLoading] = useTrigger(props.picture);
    const [isError, setError] = useTrigger(props.picture);

    console.log(isDoneLoading, isError, props.picture, props.state);

    if (isError) return <ThingPictureRaw {...props} picture={null} onError={setError} onLoad={setIsDoneLoading} />
    if (isDoneLoading || !props.picture || props.picture.startsWith("data:")) return <ThingPictureRaw {...props} onError={setError} onLoad={setIsDoneLoading} />
    return <ThingPictureRaw {...props} state={ThingState.Loading} onError={setError} onLoad={setIsDoneLoading} />
}

const ThingPictureUpload: React.FC<ThingProps> = (props) => {

    const [isLoading, setIsLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const { loading: meLoading, error: meError, data: meData } = useQuery(me);
    const client = useApolloClient();

    // resolve Picture if it is a Blob
    const [picture, setPicture] = React.useState(null);
    React.useEffect(() => {
        const effectFunction = async (picture) => {
            if (picture instanceof Blob) {
                setPicture("data:image/png;base64," + Buffer.from(await picture.arrayBuffer()).toString("base64"));
            } else {
                setPicture(picture);
            }
        }
        effectFunction(props.picture);
    }, [props.picture]);

    const canUpload = !props.state &&
        (props.onUpload ||
            (!meLoading && !meError && meData && meData.me && (!!meData.me.isadmin || meData.me.id == props.id))
        );

    if (canUpload && !props.onUpload && (props.id === null || props.id === undefined)) {
        throw new Error("ThingPicture with canUpload has not been provided an id");
    }

    const onDrop = React.useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length == 0) {
            setErrorMessage("unsupported file");
            await sleep(1000);
            setErrorMessage("");
            return;
        }
        try {
            setIsLoading(true);
            await sleep(1000);
            const image = await resizeImage(acceptedFiles[0]);

            if (props.onUpload) {
                await props.onUpload(image);
            }
            if (props.type == ThingType.User) {
                const data = await client.mutate({
                    mutation: gql`
                        mutation onUpdateEmployeePic($file: Upload!, $unitid: ID!) {
                            updateEmployeePic(file: $file, userid: $unitid) {
                                id
                                profilepicture
                            }
                        }
                    `,
                    context: { hasUpload: true },
                    variables: { file: image, unitid: props.id }
                });
                if (data.errors && data.errors.length > 0) {
                    console.warn(data.errors);
                    throw new Error(data.errors[0].message);
                }
            } else if (props.type == ThingType.Company) {
                const data = await client.mutate({
                    mutation: gql`
                    mutation onUpdateCompanyPic($file: Upload!) {
                      updateCompanyPic(file: $file) {
                        unit: unitid {
                          id
                        }
                        profilepicture
                      }
                    }
                  `,
                    context: { hasUpload: true },
                    variables: { file: image }
                });
                if (data.errors && data.errors.length > 0) {
                    console.warn(data.errors);
                    throw new Error(data.errors[0].message);
                }
            } else if (props.type == ThingType.Team) {
                const data = await client.mutate({
                    mutation: gql`
                        mutation onUpdateTeamPic($file: Upload!, $teamid: ID!) {
                            updateTeamPic(file: $file, teamid: $teamid) {
                            unitid {
                                id
                            }
                            profilepicture
                            }
                        }
                    `,
                    context: { hasUpload: true },
                    variables: { file: image, teamid: props.id }
                });
                if (data.errors && data.errors.length > 0) {
                    console.warn(data.errors);
                    throw new Error(data.errors[0].message);
                }
            }
            console.log(image);

        } catch (e) {
            console.error(e);
            setErrorMessage("error processing");
            await sleep(1000);
            setErrorMessage("");
        } finally {
            setIsLoading(false);
        }

    }, [props.type, props.id]);


    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ["image/jpg", "image/jpeg", "image/tiff", "image/gif", "image/png", "image/webp"],
        multiple: false,
        noDragEventsBubbling: true,
        disabled: !canUpload
    });

    let text = "Upload";
    const propOverwrites: Partial<ThingProps> = { picture };
    if (isLoading) {
        propOverwrites.state = ThingState.Loading;
        text = "Loading";
    }
    if (errorMessage) {
        propOverwrites.state = ThingState.Error;
        text = errorMessage;
    }

    return (
        <ThingPictureLoadState {...props} {...propOverwrites} styleModifier={props.styleModifier ? (s) => getRootProps(props.styleModifier(s)) : getRootProps}>
            <input {...getInputProps()} />
            {!isLoading && canUpload &&
                <div className="imagehover" style={isDragActive || errorMessage ? { opacity: 1 } : {}}>
                    <i className="fal fa-camera" />
                    <span style={{ lineHeight: "normal" }}>{text}</span>
                </div>
            }
        </ThingPictureLoadState>
    )
}

export const ThingPicture: React.FC<ThingProps> = (props) => {
    // this component is purely a performance optimization, bypassing unnessesary logic
    // in theory we could just use ThingPictureUpload
    // however since there might be dozens of these Pictures on one page, so it's worth to optimize a bit
    if (!props.canUpload || props.state) {
        if (!props.picture) {
            return <ThingPictureRaw {...props} />
        } else {
            return <ThingPictureLoadState {...props} />
        }
    }

    return <ThingPictureUpload {...props} />
}


interface UserPictureProps {
    id: string;
    size: number;
    className?: string;
    shape: ThingShape;
    style?: React.CSSProperties;
    hideTitle?: boolean;
    canUpload?: boolean;
}

export const UserPicture: React.FC<UserPictureProps> = (props) => {
    const { loading, error, data } = useQuery(QUERY_USER, { variables: { userid: props.id } });

    if (loading) {
        return <ThingPicture
            size={props.size}
            className={props.className}
            shape={props.shape}
            style={props.style}
            hideTitle={props.hideTitle}
            canUpload={props.canUpload}
            id={props.id}
            type={ThingType.User}
            state={ThingState.Loading}
            name={"Loading"} />
    }

    if (error || !data || !data.fetchPublicUser) {
        console.error(error);
        return <ThingPicture
            size={props.size}
            className={props.className}
            shape={props.shape}
            style={props.style}
            hideTitle={props.hideTitle}
            canUpload={props.canUpload}
            id={props.id}
            type={ThingType.User}
            state={ThingState.Error}
            name={"Error loading data"} />
    }

    return <ThingPicture
        size={props.size}
        className={props.className}
        shape={props.shape}
        style={props.style}
        hideTitle={props.hideTitle}
        canUpload={props.canUpload}
        id={props.id}
        type={ThingType.User}
        state={ThingState.Normal}
        name={concatName(data.fetchPublicUser)}
        picture={data.fetchPublicUser.profilepicture} />
}

interface TeamPictureProps extends UserPictureProps {
}

export const TeamPicture: React.FC<TeamPictureProps> = (props) => {
    const { loading, error, data } = useQuery(fetchTeamSmall, { variables: { teamid: props.id } });

    if (loading) {
        return <ThingPicture
            size={props.size}
            className={props.className}
            shape={props.shape}
            style={props.style}
            hideTitle={props.hideTitle}
            canUpload={props.canUpload}
            id={props.id}
            type={ThingType.Team}
            state={ThingState.Loading}
            name={"Loading"} />
    }

    if (error || !data || !data.fetchTeam) {
        console.error(error);
        return <ThingPicture
            size={props.size}
            className={props.className}
            shape={props.shape}
            style={props.style}
            hideTitle={props.hideTitle}
            canUpload={props.canUpload}
            id={props.id}
            type={ThingType.Team}
            state={ThingState.Error}
            name={"Error loading data"} />
    }

    return <ThingPicture
        size={props.size}
        className={props.className}
        shape={props.shape}
        style={props.style}
        hideTitle={props.hideTitle}
        canUpload={props.canUpload}
        id={props.id}
        type={ThingType.Team}
        state={ThingState.Normal}
        name={`${data.fetchTeam.name}`}
        picture={data.fetchTeam.profilepicture}
        initials={data.fetchTeam.internaldata?.initials}
        color={data.fetchTeam.internaldata?.color} />
}

interface CompanyPictureProps {
    size: number;
    className?: string;
    shape: ThingShape;
    style?: React.CSSProperties;
    hideTitle?: boolean;
    canUpload?: boolean;
}

export const CompanyPicture: React.FC<CompanyPictureProps> = (props) => {
    const { loading, error, data } = useQuery(FETCH_COMPANY);

    if (loading) {
        return <ThingPicture
            size={props.size}
            className={props.className}
            shape={props.shape}
            style={props.style}
            hideTitle={props.hideTitle}
            canUpload={props.canUpload}
            type={ThingType.Company}
            state={ThingState.Loading}
            name={"Loading"} />
    }

    if (error || !data || !data.fetchCompany || !data.fetchCompany.unit) {
        console.error(error);
        return <ThingPicture
            size={props.size}
            className={props.className}
            shape={props.shape}
            style={props.style}
            hideTitle={props.hideTitle}
            canUpload={props.canUpload}
            type={ThingType.Company}
            state={ThingState.Error}
            name={"Error loading data"} />
    }

    return <ThingPicture
        size={props.size}
        className={props.className}
        shape={props.shape}
        style={props.style}
        hideTitle={props.hideTitle}
        canUpload={props.canUpload}
        id={data.fetchCompany.unit.id}
        type={ThingType.Company}
        state={ThingState.Normal}
        name={data.fetchCompany.name}
        picture={data.fetchCompany.profilepicture}
        initials={data.fetchCompany.internaldata?.initials}
        color={data.fetchCompany.internaldata?.color} />
}