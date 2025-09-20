import { Dispatch, ReactNode, SetStateAction, createContext, useMemo, useState } from "react";

type MapStyle = "dawn" | "day" | "dusk" | "night"; 

interface Props {
    children: ReactNode
}

interface ViewLevelContextType {
    viewLevel: number,
    setViewLevel: Dispatch<SetStateAction<ViewLevelContextType['viewLevel']>>,
    valueCoordinates: [number, number] | null,
    setCoordinates: Dispatch<SetStateAction<ViewLevelContextType['valueCoordinates']>>;
    enablePlotting : boolean;
    setEnablePlotting: Dispatch<SetStateAction<boolean>>;
    zones: any[];
    setZones: (zone: any[]) => void;
    mapStyle: MapStyle;
    setMapStyle: Dispatch<SetStateAction<MapStyle>>;
    enableDirection : boolean; // This is to hold the value of the Distance API.
    setEnableDirection: Dispatch<SetStateAction<boolean>>; // This is to set the Distance API.
    enableTraffic: boolean;
    setEnableTraffic: Dispatch<SetStateAction<boolean>>;
}

export const ViewLevelContext = createContext<ViewLevelContextType | null>(null);
export default function GlobalContext({ children }: Props) {
    const [viewLevel, setViewLevel] = useState<number>(0);

    const [valueCoordinates, setCoordinates] = useState<[number, number] | null>(null);
    const [enablePlotting, setEnablePlotting] = useState<boolean>(false);
    const [zones, setZones] = useState<any[]>([]);
    const [mapStyle , setMapStyle] = useState<MapStyle>("day");
    const [enableTraffic, setEnableTraffic] = useState<boolean>(true);
    const [enableDirection, setEnableDirection] = useState<boolean>(false);


    const value = useMemo(() => {
        return { viewLevel, setViewLevel, valueCoordinates, setCoordinates, enablePlotting, setEnablePlotting, zones, setZones, mapStyle, setMapStyle, enableDirection, setEnableDirection, enableTraffic, setEnableTraffic};
    },[viewLevel, valueCoordinates, enablePlotting, zones, setZones, mapStyle, enableDirection, enableTraffic]);

    // This Zone for the all.


    return (
        <ViewLevelContext.Provider value={value}>
            {children}
        </ViewLevelContext.Provider>
    );
}
