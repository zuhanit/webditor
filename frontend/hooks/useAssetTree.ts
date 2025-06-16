import { Asset } from "@/types/schemas/asset/Asset";
import { useMemo } from "react";

export function useEntityAssetTree(totalEntities: Asset[]): (Asset & { children?: Asset[] })[] {
  const tree = useMemo(() => {
    const childrenMap = new Map<number | null, Asset[] & { children?: Asset[] }>();
    totalEntities.forEach(entity => {
      const key = entity.parent_id ?? -1;
      if (!childrenMap.has(key)) childrenMap.set(key, []);
      childrenMap.get(key)!.push(entity);
    });

    const buildTree = (parentId: number | null = -1): Asset[] & { children?: Asset[] }[] => {
      return (childrenMap.get(parentId) || []).map((entity) => {
        return {
          ...entity,
          children: buildTree(entity.id),
        };
      });
    };
    return buildTree(-1);
  }, [totalEntities]);

  return tree;

}

export function useAssetTree(totalAssets: Asset[]): (Asset & { children?: Asset[] })[] {
  return useMemo(() => {
    const childrenMap = new Map<number | null, Asset[] & { children?: Asset[] }>();
    totalAssets.forEach(asset => {
      const key = asset.parent_id ?? -1;
      if (!childrenMap.has(key)) childrenMap.set(key, []);
      childrenMap.get(key)!.push(asset);
    });

    const buildTree = (parentId: number | null = -1): Asset[] & { children?: Asset[] }[] => {
      return (childrenMap.get(parentId) || []).map(asset => ({
        ...asset,
        children: buildTree(asset.id),
      }));
    };

    return buildTree(-1);
  }, [totalAssets]);
}