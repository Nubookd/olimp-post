import { NextRequest, NextResponse } from "next/server";

const YANDEX_API_KEY = process.env.YANDEX_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return NextResponse.json(
        { success: false, message: "Не заданны обязательные параметры" },
        { status: 400 },
      );
    }

    const url = `https://geocode-maps.yandex.ru/1.x/?format=json&geocode=${lon},${lat}&apikey=${YANDEX_API_KEY}&lang=ru_RU&results=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "FoodDeliveryApp/1.0 (olimp@gmail.com)",
      },
    });
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Ошибка Яндекс API",
        },
        { status: 500 },
      );
    }
    const data = await res.json();
    const geoObjectCollection = data.response?.GeoObjectCollection;
    if (!geoObjectCollection || !geoObjectCollection.featureMember?.length) {
      return NextResponse.json({
        display_name: "Адрес не найден",
        address: {},
        lat,
        lon,
      });
    }

    const geoObject = geoObjectCollection.featureMember[0].GeoObject;
    const address = geoObject.metaDataProperty.GeocoderMetaData.text;
    const addressDetails = geoObject.metaDataProperty.GeocoderMetaData.Address;

    let country = "";
    let city = "";
    let street = "";
    let houseNumber = "";

    if (addressDetails.Components && Array.isArray(addressDetails.Components)) {
      addressDetails.Components.forEach(
        (component: {
          kind:
            | "country"
            | "locality"
            | "province"
            | "street"
            | "road"
            | "house"
            | "district"
            | string;
          name: string;
        }) => {
          switch (component.kind) {
            case "country":
              country = component.name;
              break;
            case "locality":
            case "province":
              if (!city && component.name !== "Центральный федеральный округ") {
                city = component.name;
              }
              break;
            case "street":
            case "road":
              street = component.name;
              break;
            case "house":
              houseNumber = component.name;
              break;
            case "district":
              break;
          }
        },
      );
    }

    const formattedResponse = {
      display_name: address,
      address: {
        country: country || "Россия",
        city: city || "",
        town: city || "",
        village: "",
        road: street || "",
        street: street || "",
        house_number: houseNumber || "",
        formatted: address,
      },
      lat: lat,
      lon: lon,
    };
    return NextResponse.json(formattedResponse);
  } catch (error) {
    return NextResponse.json({ post: "post" });
  }
}
